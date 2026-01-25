import redis
from redis.connection import ConnectionPool
from typing import Optional, Any
import json

from app.config import settings
from app.logger import logger


class RedisService:
    def __init__(self):
        self.pool = ConnectionPool(
            host=settings.redis_host,
            port=settings.redis_port,
            decode_responses=True,
            max_connections=10,
            socket_connect_timeout=5,
            socket_timeout=5
        )
        self.redis_client = redis.Redis(connection_pool=self.pool)

    def get_client(self):
        return self.redis_client

    def set_key(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        try:
            # Serialize dicts/lists to JSON
            if isinstance(value, (dict, list)):
                value = json.dumps(value)

            if ttl:
                return self.redis_client.setex(key, ttl, value)

            return self.redis_client.set(key, value)
        except redis.RedisError as e:
            logger.error(f"Error setting key {key}: {e}")
            return False
        except (TypeError, ValueError) as e:
            logger.error(f"Error serializing value for key {key}: {e}")
            return False

    def get_key(self, key: str, as_json: bool = False) -> Optional[Any]:
        try:
            value = self.redis_client.get(key)
            if value and as_json:
                return json.loads(value)
            return value
        except redis.RedisError as e:
            logger.error(f"Error getting key {key}: {e}")
            return None
        except json.JSONDecodeError as e:
            logger.error(f"Error deserializing JSON for key {key}: {e}")
            return None

    def delete_key(self, key: str) -> bool:
        try:
            return self.redis_client.delete(key) > 0
        except redis.RedisError as e:
            logger.error(f"Error deleting key {key}: {e}")
            return False

    def exists(self, key: str) -> bool:
        try:
            return self.redis_client.exists(key) > 0
        except redis.RedisError as e:
            logger.error(f"Error checking existence of key {key}: {e}")
            return False

    # Hash operations
    def hset(self, name: str, key: str, value: Any) -> bool:
        try:
            # Serialize dicts/lists to JSON
            if isinstance(value, (dict, list)):
                value = json.dumps(value)
            return self.redis_client.hset(name, key, value) >= 0
        except redis.RedisError as e:
            logger.error(f"Error setting hash {name}[{key}]: {e}")
            return False
        except (TypeError, ValueError) as e:
            logger.error(f"Error serializing hash value for {name}[{key}]: {e}")
            return False

    def hget(self, name: str, key: str, as_json: bool = False) -> Optional[Any]:
        """Get hash field value"""
        try:
            value = self.redis_client.hget(name, key)
            if value and as_json:
                return json.loads(value)
            return value
        except redis.RedisError as e:
            logger.error(f"Error getting hash {name}[{key}]: {e}")
            return None
        except json.JSONDecodeError as e:
            logger.error(f"Error deserializing JSON for hash {name}[{key}]: {e}")
            return None

    def hdel(self, name: str, *keys: str) -> int:
        """Delete one or more hash fields"""
        try:
            return self.redis_client.hdel(name, *keys)
        except redis.RedisError as e:
            logger.error(f"Error deleting hash fields from {name}: {e}")
            return 0

    def hgetall(self, name: str, as_json: bool = False) -> dict:
        """Get all fields and values in a hash"""
        try:
            data = self.redis_client.hgetall(name)
            if as_json and data:
                return {k: json.loads(v) if v else None for k, v in data.items()}
            return data
        except redis.RedisError as e:
            logger.error(f"Error getting all hash values from {name}: {e}")
            return {}
        except json.JSONDecodeError as e:
            logger.error(f"Error deserializing JSON for hash {name}: {e}")
            return {}

    def hexists(self, name: str, key: str) -> bool:
        """Check if hash field exists"""
        try:
            return self.redis_client.hexists(name, key)
        except redis.RedisError as e:
            logger.error(f"Error checking hash field {name}[{key}]: {e}")
            return False

    def ping(self) -> bool:
        try:
            return self.redis_client.ping()
        except redis.RedisError:
            return False

    def close(self):
        self.redis_client.close()
        self.pool.disconnect()


redis_service = RedisService()
