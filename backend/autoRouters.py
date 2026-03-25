from importlib import import_module
from pathlib import Path
from typing import List

from fastapi import APIRouter


API_ROOT = Path(__file__).resolve().parent / "api"


def _discover_router_modules() -> List[str]:
    modules: List[str] = []
    for router_file in sorted(API_ROOT.rglob("router.py")):
        relative_path = router_file.relative_to(API_ROOT.parent)
        module_name = ".".join(relative_path.with_suffix("").parts)
        modules.append(module_name)
    return modules


def load_all_routers() -> List[APIRouter]:
    routers: List[APIRouter] = []
    for module_name in _discover_router_modules():
        module = None
        for candidate in (module_name, f"backend.{module_name}"):
            try:
                module = import_module(candidate)
                break
            except ModuleNotFoundError:
                continue
        if module is None:
            raise ModuleNotFoundError(f"Unable to import router module: {module_name}")
        router = getattr(module, "router", None)
        if isinstance(router, APIRouter):
            routers.append(router)
    return routers


all_routers = load_all_routers()
