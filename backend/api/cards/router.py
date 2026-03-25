from fastapi import APIRouter, Depends, status

from ..auth.dependencies import get_current_user
from .schemas import DeleteCardEnvelope, SaveCardRequest, SavedCardEnvelope, SavedCardListEnvelope
from .service import CardsService


router = APIRouter(prefix="/api/cards", tags=["cards"])
cards_service = CardsService()


@router.post("/save", response_model=SavedCardEnvelope, status_code=status.HTTP_201_CREATED)
def save_card(payload: SaveCardRequest, current_user=Depends(get_current_user)):
    saved_card = cards_service.save_card(current_user.id, payload.card)
    return {"success": True, "data": saved_card}


@router.put("/{card_id}", response_model=SavedCardEnvelope)
def update_card(card_id: str, payload: SaveCardRequest, current_user=Depends(get_current_user)):
    saved_card = cards_service.update_card(current_user.id, card_id, payload.card)
    return {"success": True, "data": saved_card}


@router.delete("/{card_id}", response_model=DeleteCardEnvelope)
def delete_card(card_id: str, current_user=Depends(get_current_user)):
    cards_service.delete_card(current_user.id, card_id)
    return {"success": True}


@router.get("/me", response_model=SavedCardListEnvelope)
def list_my_cards(current_user=Depends(get_current_user)):
    cards = cards_service.list_my_cards(current_user.id)
    return {"success": True, "data": cards}
