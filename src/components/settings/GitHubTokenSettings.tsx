import { useState } from "react";
import { ExternalLink, KeyRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { openUrl } from "@tauri-apps/plugin-opener";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGitHubToken, useSaveGitHubToken } from "@/hooks/useSettings";

export function GitHubTokenSettings() {
  const { t } = useTranslation();
  const tokenQuery = useGitHubToken();
  const saveToken = useSaveGitHubToken();
  const [draft, setDraft] = useState<string | null>(null);
  const token = draft ?? tokenQuery.data ?? "";

  const status = (() => {
    if (tokenQuery.isError) return t("settings.github.loadFailed");
    if (tokenQuery.isPending) return t("settings.github.loading");
    if (saveToken.isPending) return t("settings.github.saving");
    if (saveToken.isError) {
      return t(
        saveToken.error.message === "githubTokenSaveFailed"
          ? "settings.github.saveFailed"
          : "settings.github.verifyFailed",
      );
    }
    if (saveToken.data?.verification) {
      return t("settings.github.active", { limit: saveToken.data.verification.limit });
    }
    return t(tokenQuery.data ? "settings.github.configured" : "settings.github.unconfigured");
  })();

  return (
    <section className="space-y-4" aria-labelledby="github-connection-title">
      <div className="flex items-center gap-2 border-b border-border/40 pb-2">
        <KeyRound className="h-4 w-4 text-muted-foreground" />
        <h3 id="github-connection-title" className="text-sm font-medium">
          {t("settings.github.title")}
        </h3>
      </div>
      <div className="space-y-4 rounded-xl border border-border bg-card/50 p-4">
        <div id="github-token-help" className="space-y-2 text-xs text-muted-foreground">
          <ol className="list-decimal space-y-1 pl-4">
            <li>{t("settings.github.step1")}</li>
            <li>{t("settings.github.step2")}</li>
            <li>{t("settings.github.step3")}</li>
          </ol>
          <p>{t("settings.github.permissions")}</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => {
            openUrl("https://github.com/settings/personal-access-tokens/new").catch(() =>
              toast.error(t("settings.github.openFailed")),
            );
          }}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {t("settings.github.create")}
        </Button>
        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (saveToken.isPending || tokenQuery.isPending || tokenQuery.isError) return;
            saveToken.mutate(token, { onSuccess: (result) => setDraft(result.token) });
          }}
        >
          <label htmlFor="github-token" className="text-sm font-medium">
            {t("settings.github.label")}
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="github-token"
              name="github_token"
              type="password"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              aria-describedby="github-token-help github-token-status"
              aria-invalid={saveToken.isError}
              placeholder={t("settings.github.placeholder")}
              value={token}
              disabled={tokenQuery.isPending || tokenQuery.isError || saveToken.isPending}
              onChange={(event) => {
                setDraft(event.target.value);
                saveToken.reset();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && event.nativeEvent.isComposing) event.preventDefault();
              }}
            />
            <Button
              type="submit"
              size="sm"
              disabled={tokenQuery.isPending || tokenQuery.isError || saveToken.isPending}
            >
              {t("settings.github.save")}
            </Button>
          </div>
          <p id="github-token-status" role="status" className="text-xs text-muted-foreground">
            {status}
          </p>
          <p className="text-xs text-muted-foreground">{t("settings.github.clearHint")}</p>
        </form>
      </div>
    </section>
  );
}
