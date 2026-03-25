from fastapi import HTTPException, status

from .repository import WalletRepository


class WalletService:
    def __init__(self, repository: WalletRepository | None = None):
        self.repository = repository or WalletRepository()

    def get_balance(self, user_id: int) -> dict:
        wallet = self.repository.get_wallet(user_id)
        if not wallet:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User wallet not found")
        return {"coins": int(wallet.get("coins", 0))}

    def spend(self, user_id: int, amount: int, reason: str) -> dict:
        wallet = self.repository.get_wallet(user_id)
        if not wallet:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User wallet not found")

        current_coins = int(wallet.get("coins", 0))
        if current_coins < amount:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not enough coins")

        affected_rows = self.repository.spend_coins(user_id, amount)
        if affected_rows <= 0:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Failed to spend coins")

        return self.get_balance(user_id)

    def recharge(self, user_id: int, amount: int, reason: str) -> dict:
        affected_rows = self.repository.add_coins(user_id, amount)
        if affected_rows <= 0:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Failed to recharge coins")
        return self.get_balance(user_id)
