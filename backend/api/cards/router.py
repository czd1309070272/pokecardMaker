from fastapi import APIRouter, Depends, Query, status

from ..auth.dependencies import get_current_user, get_optional_current_user
from .schemas import (
    CardCommentEnvelope,
    CardCommentListEnvelope,
    CreateCardCommentRequest,
    DeleteCardEnvelope,
    DeleteCommentEnvelope,
    PublicCardsEnvelope,
    PublishCardEnvelope,
    PublishCardRequest,
    SaveCardAppraisalEnvelope,
    SaveCardAppraisalRequest,
    SaveCardRequest,
    SavedCardEnvelope,
    SavedCardListEnvelope,
    ToggleLikeEnvelope,
    ToggleFavoriteEnvelope,
)
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


@router.get("/favorited", response_model=SavedCardListEnvelope)
def list_favorited_cards(current_user=Depends(get_current_user)):
    cards = cards_service.list_favorited_cards(current_user.id)
    return {"success": True, "data": cards}


@router.get("/public", response_model=PublicCardsEnvelope)
def list_public_cards(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=50),
    sort: str = Query(default="trending"),
    current_user=Depends(get_optional_current_user),
):
    cards = cards_service.list_public_cards(
        page=page,
        limit=limit,
        sort=sort,
        viewer_user_id=current_user.id if current_user else None,
    )
    return {"success": True, "data": cards}


@router.get("/{card_id}/comments", response_model=CardCommentListEnvelope)
def list_card_comments(
    card_id: str,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=5, ge=1, le=50),
    current_user=Depends(get_optional_current_user),
):
    comments = cards_service.list_card_comments(
        card_id,
        page=page,
        limit=limit,
        viewer_user_id=current_user.id if current_user else None,
    )
    return {"success": True, "data": comments}


@router.patch("/{card_id}/publish", response_model=PublishCardEnvelope)
def publish_card(card_id: str, payload: PublishCardRequest, current_user=Depends(get_current_user)):
    saved_card = cards_service.publish_card(current_user.id, card_id, payload.isPublic)
    return {"success": True, "data": saved_card}


@router.post("/{card_id}/like", response_model=ToggleLikeEnvelope)
def toggle_like(card_id: str, current_user=Depends(get_current_user)):
    result = cards_service.toggle_like(current_user.id, card_id)
    return {"success": True, "data": result}


@router.post("/{card_id}/favorite", response_model=ToggleFavoriteEnvelope)
def toggle_favorite(card_id: str, current_user=Depends(get_current_user)):
    result = cards_service.toggle_favorite(current_user.id, card_id)
    return {"success": True, "data": result}


@router.post("/{card_id}/appraisal", response_model=SaveCardAppraisalEnvelope)
def save_card_appraisal(card_id: str, payload: SaveCardAppraisalRequest, current_user=Depends(get_current_user)):
    saved_card = cards_service.save_card_appraisal(current_user.id, card_id, payload.model_dump())
    return {"success": True, "data": saved_card}


@router.post("/{card_id}/comments", response_model=CardCommentEnvelope, status_code=status.HTTP_201_CREATED)
def create_card_comment(card_id: str, payload: CreateCardCommentRequest, current_user=Depends(get_current_user)):
    comment = cards_service.create_card_comment(current_user.id, card_id, payload.content)
    return {"success": True, "data": comment}


@router.delete("/{card_id}/comments/{comment_id}", response_model=DeleteCommentEnvelope)
def delete_card_comment(card_id: str, comment_id: int, current_user=Depends(get_current_user)):
    cards_service.delete_card_comment(current_user.id, card_id, comment_id)
    return {"success": True}
