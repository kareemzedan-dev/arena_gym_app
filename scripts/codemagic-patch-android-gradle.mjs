import fs from "node:fs";

const path = "android/app/build.gradle";
let text = fs.readFileSync(path, "utf8");

if (!text.includes("signingConfigs {")) {
  throw new Error(`${path} has no signingConfigs block`);
}

if (!text.includes("CM_KEYSTORE_PATH")) {
  const debugClose = `            keyPassword 'android'
        }
    }`;
  const withRelease = `            keyPassword 'android'
        }
        release {
            def keystorePath = System.getenv()["CM_KEYSTORE_PATH"]
            if (!keystorePath) {
                throw new GradleException("CI release builds require CM_KEYSTORE_PATH (Codemagic android_signing).")
            }
            storeFile file(keystorePath)
            storePassword System.getenv()["CM_KEYSTORE_PASSWORD"]
            keyAlias System.getenv()["CM_KEY_ALIAS"]
            keyPassword System.getenv()["CM_KEY_PASSWORD"]
        }
    }`;
  if (!text.includes(debugClose)) {
    throw new Error(`${path} debug signing block did not match Expo template`);
  }
  text = text.replace(debugClose, withRelease);
}

const debugReleaseSigning = `        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug`;
const ciReleaseSigning = `        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.release`;
if (text.includes(debugReleaseSigning)) {
  text = text.replace(debugReleaseSigning, ciReleaseSigning);
}

text = text.replace(
  /versionCode\s+\d+/,
  "versionCode (project.hasProperty('cmVersionCode') ? cmVersionCode.toInteger() : 37)",
);

fs.writeFileSync(path, text);
console.log(`Patched ${path} for Codemagic release signing`);
