FROM mysql:8.0

# Используем microdnf вместо apt-get для MySQL 8
RUN microdnf install -y tzdata && \
    microdnf clean all

ENV TZ=Europe/Moscow

# Копируем SQL файлы в порядке их выполнения
COPY ./init.sql /docker-entrypoint-initdb.d/1-init.sql
COPY ./schema.sql /docker-entrypoint-initdb.d/2-schema.sql
COPY ./seed.sql /docker-entrypoint-initdb.d/3-seed.sql

# Устанавливаем параметры MySQL для использования UTF-8
CMD ["mysqld", "--character-set-server=utf8mb4", "--collation-server=utf8mb4_unicode_ci"]
