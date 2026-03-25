from minio import Minio

client = Minio(
    "localhost:9000",
    access_key="admin",
    secret_key="Test@123",
    secure=False
)

print(client.list_buckets())