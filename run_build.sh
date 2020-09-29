#!/usr/bin/env bash
cd android
./gradlew assembleRelease
cp app/build/outputs/apk/release/app-release.apk ~/Public/vocaltrance.apk