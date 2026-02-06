import multiprocessing
import os

bind = f"0.0.0.0:{os.environ['PORT']}"

workers = 1
worker_class = "uvicorn.workers.UvicornWorker"

timeout = 60
keepalive = 5

loglevel = "info"
accesslog = "-"
errorlog = "-"
