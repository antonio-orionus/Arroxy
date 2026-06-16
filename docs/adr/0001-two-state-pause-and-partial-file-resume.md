# Pause has two states, and interrupted jobs resume from partial files

A paused or interrupted job must be able to continue rather than restart, even
across an app restart, so we distinguish a **held pause** (the job never started
— resuming simply lets it begin) from an **active pause** (the job was already
downloading — resuming re-spawns the downloader pointed at the same partial
files). The link back to those files is persisted on the queue item, so resume
survives a full quit.

We accept the added state-machine and persistence complexity because the
alternative — discarding partial progress on every interruption — is a poor
experience for large or rate-limited downloads.

## Consequences

Automatic retry after a *failure* (as opposed to a user pause) reuses the same
partial-file mechanism, but only for failures where resuming is actually safe:
transient transfer, network, rate-limit, post-process, and out-of-disk errors.
Other failure kinds start fresh, because resuming them would reuse a corrupt or
meaningless partial state.
