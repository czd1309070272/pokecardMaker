from fastapi import APIRouter, Depends

from ..auth.dependencies import get_current_user
from .schemas import (
    AppraiseCardEnvelope,
    AppraiseCardRequest,
    GenerateCardTextEnvelope,
    GenerateCardTextRequest,
)
from .service import AIService


router = APIRouter(prefix="/api/ai", tags=["ai"])
ai_service = AIService()


@router.post("/generate-text", response_model=GenerateCardTextEnvelope)
async def generate_card_text(payload: GenerateCardTextRequest, current_user=Depends(get_current_user)):
    result = await ai_service.generate_card_text(current_user.id, payload.prompt, payload.language, payload.card)
    return {"success": True, "data": result}


@router.post("/appraise", response_model=AppraiseCardEnvelope)
async def appraise_card(payload: AppraiseCardRequest, current_user=Depends(get_current_user)):
    result = await ai_service.appraise_card(current_user.id, payload.card, payload.language)
    return {"success": True, "data": result}
