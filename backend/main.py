from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv
import asyncio
from services.outbox_worker import run_outbox_worker
from services.cleanup_worker import run_cleanup_worker
from routers import auth, users, sync
from limiter import limiter

load_dotenv()

app = FastAPI(title="Vaga Pipe API")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(sync.router)


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(run_outbox_worker())
    asyncio.create_task(run_cleanup_worker())


@app.get("/")
async def root():
    return {"message": "Vaga Pipe API is running"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}
