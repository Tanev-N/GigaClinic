import redis
from typing import Optional

class RedisProvider:
    _instance: Optional[redis.Redis] = None

    @classmethod
    def initialize(cls, host: str, port: int):
        cls._instance = redis.Redis(
            host=host,
            port=port,
            decode_responses=True
        )
    
    @classmethod
    def get_client(cls) -> redis.Redis:
        if cls._instance is None:
            raise RuntimeError("Redis client not initialized")
        return cls._instance 