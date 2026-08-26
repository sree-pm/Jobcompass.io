// Node ESM resolver: retry failed relative "./x.js" specifiers as "./x.ts"
// (mirrors esbuild/wrangler bundler behaviour so we can unit-test .ts sources directly)
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if ((specifier.startsWith("./") || specifier.startsWith("../")) && specifier.endsWith(".js")) {
      try {
        return await nextResolve(specifier.slice(0, -3) + ".ts", context);
      } catch {
        // fall through to original error
      }
    }
    throw err;
  }
}
