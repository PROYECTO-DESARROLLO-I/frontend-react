#!/usr/bin/env bash
#
# deploy-frontend.sh
#
# Compila el frontend (Vite) con la URL del API inyectada por variable de
# entorno y, opcionalmente, lo sube a S3 e invalida la caché de CloudFront.
#
# Variables de entorno:
#   VITE_API_URL                 (requerida) URL base del backend, ej:
#                                 https://api.midominio.com
#                                 Si S3_BUCKET está definida, debe empezar
#                                 por https:// (ver ALLOW_HTTP más abajo).
#   S3_BUCKET                    (opcional) nombre del bucket S3 destino.
#                                 Si no se define, solo se hace el build.
#   CLOUDFRONT_DISTRIBUTION_ID   (opcional) ID de la distribución de
#                                 CloudFront a invalidar tras el sync.
#                                 Solo se usa si S3_BUCKET está definida.
#   ALLOW_HTTP                   (opcional) si se define como "1", permite
#                                 desplegar a S3 aunque VITE_API_URL no sea
#                                 https:// (solo recomendado para pruebas).
#
# Ejemplo de uso:
#   VITE_API_URL=https://api.midominio.com S3_BUCKET=mi-bucket \
#     ./deploy/deploy-frontend.sh
#
export AWS_PROFILE="desarrollo1"
S3_BUCKET="frontend-desarrollo-rubio-dev"
CLOUDFRONT_DISTRIBUTION_ID="E1W8CUUNZAXCAC"
VITE_API_URL="https://d3bdztqqo72is9.cloudfront.net"
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/../package.json" ]; then
  # El script vive dentro del repo (carpeta deploy/)
  PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
else
  # El script vive en ~/desarrollo1/deploy-scripts, junto a los repos
  PROJECT_ROOT="$(cd "$SCRIPT_DIR/../frontend-react" && pwd)"
fi

cd "$PROJECT_ROOT"

echo "==> Verificando variables de entorno requeridas..."

if [[ -z "${VITE_API_URL:-}" ]]; then
  echo "ERROR: la variable de entorno VITE_API_URL es obligatoria." >&2
  echo "       Define la URL HTTPS del backend antes de ejecutar este script." >&2
  echo "       Ejemplo: VITE_API_URL=https://api.midominio.com $0" >&2
  exit 1
fi

export VITE_API_URL

echo "==> VITE_API_URL=${VITE_API_URL}"

if [[ "${VITE_API_URL}" != https://* ]]; then
  if [[ -n "${S3_BUCKET:-}" ]]; then
    if [[ "${ALLOW_HTTP:-}" == "1" ]]; then
      echo "AVISO: VITE_API_URL no empieza por https:// (${VITE_API_URL})." >&2
      echo "       Continuando de todos modos porque ALLOW_HTTP=1 (solo para pruebas)." >&2
    else
      echo "ERROR: VITE_API_URL debe empezar por https:// para desplegar a S3/CloudFront." >&2
      echo "       Valor actual: ${VITE_API_URL}" >&2
      echo "       CloudFront sirve el frontend por HTTPS, y si VITE_API_URL apunta a" >&2
      echo "       http://, el navegador bloqueará las peticiones al backend por" >&2
      echo "       contenido mixto (mixed content)." >&2
      echo "       Si es intencional (por ejemplo, pruebas contra un backend sin TLS)," >&2
      echo "       vuelve a ejecutar el script con ALLOW_HTTP=1 para forzar el build/deploy." >&2
      exit 1
    fi
  else
    echo "AVISO: VITE_API_URL no empieza por https:// (${VITE_API_URL})." >&2
    echo "       Esto es solo un build local (S3_BUCKET no está definida), pero recuerda" >&2
    echo "       que en producción, detrás de CloudFront (HTTPS), debe ser https://." >&2
  fi
fi

echo "==> Instalando dependencias..."
if [[ -f "package-lock.json" ]]; then
  npm ci
else
  echo "AVISO: no se encontró package-lock.json, se usará 'npm install'." >&2
  npm install
fi

echo "==> Compilando el frontend (npm run build)..."
npm run build

echo "==> Build completado. Archivos generados en dist/"

if [[ -n "${S3_BUCKET:-}" ]]; then
  echo "==> S3_BUCKET definido (${S3_BUCKET}). Verificando AWS CLI..."

  if ! command -v aws >/dev/null 2>&1; then
    echo "ERROR: no se encontró el comando 'aws' (AWS CLI)." >&2
    echo "       Instálalo y configura tus credenciales antes de continuar." >&2
    exit 1
  fi

  echo "==> Sincronizando dist/ con s3://${S3_BUCKET} ..."
  # Los archivos con hash en el nombre (JS/CSS/assets) se cachean de forma
  # agresiva e inmutable; index.html se marca como no-cacheable para que,
  # aunque no se invalide CloudFront, nunca se sirva una versión vieja.
  aws s3 sync dist/ "s3://${S3_BUCKET}" --delete \
    --cache-control "public,max-age=31536000,immutable" \
    --exclude "index.html"
  aws s3 cp dist/index.html "s3://${S3_BUCKET}/index.html" \
    --cache-control "no-cache"

  echo "==> Archivos subidos correctamente a s3://${S3_BUCKET}"

  if [[ -n "${CLOUDFRONT_DISTRIBUTION_ID:-}" ]]; then
    echo "==> Invalidando caché de CloudFront (${CLOUDFRONT_DISTRIBUTION_ID})..."
    aws cloudfront create-invalidation \
      --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" \
      --paths "/*"
    echo "==> Invalidación de CloudFront solicitada."
  else
    echo "AVISO: CLOUDFRONT_DISTRIBUTION_ID no está definida, no se invalidó caché."
    echo "       Si usas CloudFront delante del bucket, recuerda invalidarla"
    echo "       manualmente para ver los cambios reflejados."
  fi

  echo "==> Despliegue completado."
else
  echo "==> S3_BUCKET no está definida. Solo se generó el build local."
  echo ""
  echo "Para subir manualmente el contenido de dist/ a S3, ejecuta algo como:"
  echo "  aws s3 sync dist/ s3://<tu-bucket> --delete"
  echo ""
  echo "Si tienes CloudFront delante del bucket, invalida la caché con:"
  echo "  aws cloudfront create-invalidation --distribution-id <ID> --paths \"/*\""
fi
