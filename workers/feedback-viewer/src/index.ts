import {handleFeedbackLog, type FeedbackLogEnv} from './feedbackLog.js';

export interface ViewerEnv extends FeedbackLogEnv {
  ASSETS: Fetcher;
}

const FEEDBACK_LOG_PATH = '/arroxy/api/admin/feedback-log';

// The pages under /arroxy/admin/ are static assets served before this script
// runs; only /arroxy/api/admin/* reaches it (assets.run_worker_first).
// Cloudflare Access guards every route at the edge, and handleFeedbackLog
// verifies the Access JWT again.
export default {
  async fetch(request: Request, env: ViewerEnv): Promise<Response> {
    const {pathname} = new URL(request.url);
    if (pathname === FEEDBACK_LOG_PATH) return handleFeedbackLog(request, env);
    if (pathname.startsWith('/arroxy/api/')) {
      return new Response(JSON.stringify({error: 'not_found'}), {
        status: 404,
        headers: {'cache-control': 'no-store', 'content-type': 'application/json; charset=utf-8'}
      });
    }
    return env.ASSETS.fetch(request);
  }
} satisfies ExportedHandler<ViewerEnv>;
