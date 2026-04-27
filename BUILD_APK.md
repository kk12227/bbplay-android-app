# Сборка BBplay APK для Android

---

## Что потребуется

| Инструмент | Версия | Скачать |
|---|---|---|
| **Node.js** | 18+ LTS | [nodejs.org](https://nodejs.org) |
| **Android Studio** | Koala / Ladybug | [developer.android.com/studio](https://developer.android.com/studio) |
| **JDK** | 17 | устанавливается вместе с Android Studio |

> Android Studio нужен только для первой сборки. После настройки можно собирать через командную строку.

---

## Шаг 1 — Установка Android Studio

1. Скачай и установи [Android Studio](https://developer.android.com/studio)
2. При первом запуске: **SDK Manager** → убедись, что установлен **Android SDK 34**
3. Добавь переменную среды `ANDROID_HOME`:

**Windows:**
```
Панель управления → Система → Переменные среды → Добавить:
ANDROID_HOME = C:\Users\ИМЯ\AppData\Local\Android\Sdk

PATH += %ANDROID_HOME%\platform-tools
PATH += %ANDROID_HOME%\tools
```

**Mac / Linux:**
```bash
echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bashrc
source ~/.bashrc
```

---

## Шаг 2 — Подготовка проекта

```bash
# Распакуй архив, зайди в папку
cd bbplay

# Установи зависимости
npm install

# Создай .env файл
cp .env.example .env
# (опционально) добавь ключи: VITE_ANTHROPIC_API_KEY и VITE_VK_TOKEN

# Собери веб-часть и синхронизируй с Android
npm run cap:sync
```

---

## Шаг 3 — Сборка Debug APK (для тестирования)

```bash
npm run apk:debug
```

Готовый APK будет здесь:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

**Установка на телефон:**
```bash
# Подключи телефон по USB (включи USB отладку в настройках разработчика)
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

Или просто скопируй `app-debug.apk` на телефон и открой файловым менеджером.

---

## Шаг 4 — Сборка Release APK (для публикации)

### 4.1 Создай keystore (один раз)

```bash
keytool -genkey -v \
  -keystore android/release.keystore \
  -alias bbplay \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Введи пароль и данные организации. **Сохрани keystore и пароль — без них нельзя обновить приложение!**

### 4.2 Добавь данные подписи

Создай файл `android/local.properties` (не добавляй в git!):
```properties
RELEASE_STORE_FILE=release.keystore
RELEASE_KEY_ALIAS=bbplay
RELEASE_STORE_PASSWORD=твой_пароль
RELEASE_KEY_PASSWORD=твой_пароль
```

### 4.3 Обнови `android/app/build.gradle`

Найди секцию `android { ... }` и добавь:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('../release.keystore')
            storePassword System.getenv("RELEASE_STORE_PASSWORD") ?: project.property("RELEASE_STORE_PASSWORD")
            keyAlias System.getenv("RELEASE_KEY_ALIAS") ?: project.property("RELEASE_KEY_ALIAS")
            keyPassword System.getenv("RELEASE_KEY_PASSWORD") ?: project.property("RELEASE_KEY_PASSWORD")
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 4.4 Собери Release APK

```bash
npm run apk:release
```

Готовый APK:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## Шаг 5 — Открыть в Android Studio (альтернатива)

```bash
npm run cap:android
# Откроется Android Studio с проектом
```

В Android Studio:
- **Build → Build Bundle(s) / APK(s) → Build APK(s)** — Debug APK
- **Build → Generate Signed Bundle / APK** — Release APK / AAB для Play Store

---

## Размер и совместимость

| Параметр | Значение |
|---|---|
| Min Android | 5.1 (API 22) |
| Target Android | 14 (API 34) |
| Ориентация | Только портрет |
| Размер debug APK | ~6–8 МБ |
| Размер release APK | ~4–5 МБ |

---

## Быстрая установка без сборки (ADB)

```bash
# Включи USB-отладку на телефоне: Настройки → Для разработчиков
adb devices          # убедись что телефон виден
adb install app-debug.apk
adb shell am start -n ru.bbplay.app/.MainActivity
```

---

## Публикация в Google Play

1. Собери **AAB** (Android App Bundle): Build → Generate Signed Bundle / APK → Android App Bundle
2. Зарегистрируйся в [Google Play Console](https://play.google.com/console) ($25 единоразово)
3. Создай приложение → загрузи AAB → заполни описание → опубликуй

---

## Troubleshooting

| Ошибка | Решение |
|---|---|
| `ANDROID_HOME not set` | Добавь переменную среды (см. Шаг 1) |
| `SDK not found` | Android Studio → SDK Manager → установи API 34 |
| `Gradle sync failed` | File → Sync Project with Gradle Files |
| `Cannot find JDK` | Studio → Settings → Build → Gradle → JDK = встроенный |
| `adb: device not found` | Включи USB-отладку, попробуй другой кабель |
| Белый экран в приложении | Проверь что запущен `npm run cap:sync` после изменений |

---

*BBplay · Black Bears · Тамбов*
