import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { ElectronApplication, Page } from '@playwright/test';
import type { AppSettings } from '../../src/shared/types.js';
import { assertNoExternalRequests, buildFixtureEnv, fixturePlaylistUrl, fixtureUrl, runProcess, startDenyProxy, startFixtureServer, writeE2eSettings, type FixtureServer, type FixtureServerBehavior, type ProcessResult } from './fixtureHarness.js';
import { expectMp4Count, expectNoMp4For, expectQueueStatus, launchFixtureApp, listFilesRecursive, mediaFiles, prepareFixtureRuntime, queueCardByTitle } from './fixtureWorkflow.js';

interface FixtureProductOptions {
  behavior?: FixtureServerBehavior;
  settings?: (settings: AppSettings) => void;
  userDataPrefix?: string;
  outputPrefix?: string;
}

interface FixtureYtDlpOptions {
  behavior?: FixtureServerBehavior;
  userDataPrefix?: string;
  outputPrefix?: string;
}

interface UrlHelpers {
  video: (videoId: string) => string;
  playlist: () => string;
  videos: (videoIds: readonly string[]) => string[];
}

interface QueueHelpers {
  cardByTitle: (title: string) => ReturnType<typeof queueCardByTitle>;
  expectStatus: (title: string, status: string, timeout?: number) => Promise<void>;
}

interface FileHelpers {
  listRecursive: (dir?: string) => string[];
  mediaFiles: (extension: string, dir?: string) => string[];
  expectMp4Count: (count: number, dir?: string) => void;
  expectNoMp4For: (videoId: string, dir?: string) => void;
}

export interface FixtureProductContext {
  app: ElectronApplication;
  page: Page;
  fixtureServer: FixtureServer;
  userDataDir: string;
  outputDir: string;
  urls: UrlHelpers;
  queue: QueueHelpers;
  files: FileHelpers;
  relaunch: () => Promise<{ app: ElectronApplication; page: Page; queue: QueueHelpers }>;
}

export interface FixtureYtDlpContext {
  fixtureServer: FixtureServer;
  userDataDir: string;
  outputDir: string;
  ytDlpPath: string;
  env: Record<string, string>;
  urls: UrlHelpers;
  runYtDlp: (args: string[], timeoutMs?: number) => Promise<ProcessResult>;
}

function urls(): UrlHelpers {
  return {
    video: fixtureUrl,
    playlist: fixturePlaylistUrl,
    videos: (videoIds) => videoIds.map(fixtureUrl)
  };
}

function queue(page: Page): QueueHelpers {
  return {
    cardByTitle: (title) => queueCardByTitle(page, title),
    expectStatus: (title, status, timeout) => expectQueueStatus(page, title, status, timeout)
  };
}

function files(outputDir: string): FileHelpers {
  return {
    listRecursive: (dir = outputDir) => listFilesRecursive(dir),
    mediaFiles: (extension, dir = outputDir) => mediaFiles(dir, extension),
    expectMp4Count: (count, dir = outputDir) => expectMp4Count(dir, count),
    expectNoMp4For: (videoId, dir = outputDir) => expectNoMp4For(dir, videoId)
  };
}

async function attemptCleanup(cleanup: () => Promise<void> | void): Promise<void> {
  try {
    await cleanup();
  } catch {
    // Best-effort test teardown; keep draining the remaining resources.
  }
}

export async function withFixtureProductApp(options: FixtureProductOptions, run: (ctx: FixtureProductContext) => Promise<void>): Promise<void> {
  const ytDlpPath = await prepareFixtureRuntime();
  const fixtureServer = await startFixtureServer(options.behavior);
  const denyProxy = await startDenyProxy();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), options.userDataPrefix ?? 'arroxy-fixture-user-'));
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), options.outputPrefix ?? 'arroxy-fixture-out-'));
  writeE2eSettings(userDataDir, outputDir, options.settings);

  let app: ElectronApplication | null = null;
  try {
    const launched = await launchFixtureApp(ytDlpPath, { userDataDir, fixtureServer, denyProxy });
    app = launched.app;
    await run({
      app,
      page: launched.page,
      fixtureServer,
      userDataDir,
      outputDir,
      urls: urls(),
      queue: queue(launched.page),
      files: files(outputDir),
      relaunch: async () => {
        if (app) await app.close();
        const next = await launchFixtureApp(ytDlpPath, { userDataDir, fixtureServer, denyProxy });
        app = next.app;
        return { app: next.app, page: next.page, queue: queue(next.page) };
      }
    });
    assertNoExternalRequests(denyProxy);
  } finally {
    const appToClose = app;
    await Promise.all([appToClose ? attemptCleanup(() => appToClose.close()) : Promise.resolve(), attemptCleanup(() => denyProxy.close()), attemptCleanup(() => fixtureServer.close())]);
    await attemptCleanup(() => fs.rmSync(userDataDir, { recursive: true, force: true }));
    await attemptCleanup(() => fs.rmSync(outputDir, { recursive: true, force: true }));
  }
}

export async function withFixtureYtDlp(options: FixtureYtDlpOptions, run: (ctx: FixtureYtDlpContext) => Promise<void>): Promise<void> {
  const ytDlpPath = await prepareFixtureRuntime();
  const fixtureServer = await startFixtureServer(options.behavior);
  const denyProxy = await startDenyProxy();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), options.userDataPrefix ?? 'arroxy-fixture-ytdlp-user-'));
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), options.outputPrefix ?? 'arroxy-fixture-ytdlp-out-'));
  const env = buildFixtureEnv({ userDataDir, fixtureServer, denyProxy, ytDlpPath });

  try {
    await run({
      fixtureServer,
      userDataDir,
      outputDir,
      ytDlpPath,
      env,
      urls: urls(),
      runYtDlp: (args, timeoutMs) => runProcess(ytDlpPath, args, { env, timeoutMs })
    });
    assertNoExternalRequests(denyProxy);
  } finally {
    await Promise.all([attemptCleanup(() => denyProxy.close()), attemptCleanup(() => fixtureServer.close())]);
    await attemptCleanup(() => fs.rmSync(userDataDir, { recursive: true, force: true }));
    await attemptCleanup(() => fs.rmSync(outputDir, { recursive: true, force: true }));
  }
}
