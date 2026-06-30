#!/bin/bash
set -e
required=("DATABASE_URL" "JWT_SECRET" "NODE_ENV")
for var in "${required[@]}"; do
  if [ -z "${!var}" ]; then
    echo "Variable manquante : $var"
    exit 1
  fi
done
echo "Toutes les variables sont definies"
