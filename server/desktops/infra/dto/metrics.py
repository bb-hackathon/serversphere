from pydantic import BaseModel


class MetricsDTO(BaseModel):
    cpu_usage: float
    ram_usage: float
    process_count: int
