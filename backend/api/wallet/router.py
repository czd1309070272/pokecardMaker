from fastapi import APIRouter, Depends

from ..auth.dependencies import get_current_user
from .schemas import RechargeRequest, SpendCoinsRequest, WalletBalanceEnvelope, WalletMutationResponse
from .service import WalletService


router = APIRouter(prefix="/api/wallet", tags=["wallet"])
wallet_service = WalletService()


@router.get("/balance", response_model=WalletBalanceEnvelope)
def get_balance(current_user=Depends(get_current_user)):
    balance = wallet_service.get_balance(current_user.id)
    return {"success": True, "data": balance}


@router.post("/spend", response_model=WalletMutationResponse)
def spend_coins(payload: SpendCoinsRequest, current_user=Depends(get_current_user)):
    balance = wallet_service.spend(current_user.id, payload.amount, payload.reason)
    return {"success": True, "data": balance, "message": "Coins spent successfully"}


@router.post("/recharge", response_model=WalletMutationResponse)
def recharge_coins(payload: RechargeRequest, current_user=Depends(get_current_user)):
    balance = wallet_service.recharge(current_user.id, payload.amount, payload.reason)
    return {"success": True, "data": balance, "message": "Coins recharged successfully"}
