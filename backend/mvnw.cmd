@REM ----------------------------------------------------------------------------
@REM Maven Wrapper startup batch script for Windows
@REM ----------------------------------------------------------------------------

@echo off
setlocal

set MAVEN_PROJECTBASEDIR=%~dp0
set WRAPPER_PROPERTIES="%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.properties"
set MAVEN_VERSION=3.9.9
set DOWNLOAD_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/%MAVEN_VERSION%/apache-maven-%MAVEN_VERSION%-bin.zip
set MAVEN_HOME=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\dists\apache-maven-%MAVEN_VERSION%

@REM Check if Maven is already downloaded
if exist "%MAVEN_HOME%\apache-maven-%MAVEN_VERSION%\bin\mvn.cmd" goto runMaven

@REM Download Maven
echo Maven not found. Downloading Maven %MAVEN_VERSION%...
mkdir "%MAVEN_HOME%" 2>nul

@REM Try PowerShell download
echo Downloading from %DOWNLOAD_URL%...
powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%DOWNLOAD_URL%' -OutFile '%MAVEN_HOME%\maven.zip' }"

if not exist "%MAVEN_HOME%\maven.zip" (
    echo ERROR: Failed to download Maven. Please check your internet connection.
    exit /b 1
)

@REM Extract
echo Extracting Maven...
powershell -Command "& { Expand-Archive -Path '%MAVEN_HOME%\maven.zip' -DestinationPath '%MAVEN_HOME%' -Force }"
del "%MAVEN_HOME%\maven.zip"

echo Maven %MAVEN_VERSION% installed successfully!

:runMaven
set MAVEN_CMD="%MAVEN_HOME%\apache-maven-%MAVEN_VERSION%\bin\mvn.cmd"
%MAVEN_CMD% %*
