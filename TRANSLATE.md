Download this patch and apply it to translate the entire codebase to English:

```bash
git clone https://github.com/ungden/snapstudio.git
cd snapstudio
# Download the patch from the 'patches' branch
git fetch origin patches
git diff origin/main origin/patches -- . | git apply
git add -A && git commit -m 'Translate to English' && git push
```
