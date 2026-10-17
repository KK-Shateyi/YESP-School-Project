<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Cloud Auth and public.user_roles are authoritative; browser legacy demo records must never authorize access.
- Initialize account data and subscribe to identity changes once in the root; cancel and clear query caches before sign-out.
- Public listings use a public server function for SSR, while account writes and private CV reads use the generated browser client with owner-scoped RLS.
- Keep matching and validation as pure shared helpers so recommendation and form rules can be tested independently.
- Save CVs as structured contact and career fields in the existing owner-scoped cvs table; printing uses a dedicated print-only preview.
