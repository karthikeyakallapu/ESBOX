import multiprocessing
import os

bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"

workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "uvicorn.workers.UvicornWorker"

timeout = 60
keepalive = 5

loglevel = "info"
accesslog = "-"
errorlog = "-"
