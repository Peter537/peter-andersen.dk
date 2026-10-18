export default {
  async scheduled(_controller, env) {
    const deployHookUrl = env.PAGES_DEPLOY_HOOK_URL;
    if (typeof deployHookUrl !== "string" || deployHookUrl.trim() === "") {
      throw new Error("PAGES_DEPLOY_HOOK_URL is required");
    }

    let response;
    try {
      response = await fetch(deployHookUrl, {
        method: "POST",
        redirect: "manual",
        signal: AbortSignal.timeout(30_000),
      });
    } catch {
      // Fetch errors can contain the secret hook URL.
      throw new Error("Cloudflare Pages deploy hook request failed");
    }

    if (!response.ok) {
      throw new Error(
        "Cloudflare Pages deploy hook returned HTTP " + response.status,
      );
    }
  },
};
