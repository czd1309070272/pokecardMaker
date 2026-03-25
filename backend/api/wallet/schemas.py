from pydantic import BaseModel, Field


class WalletBalance(BaseModel):
    coins: int


class WalletBalanceEnvelope(BaseModel):
    success: bool = True
    data: WalletBalance


class SpendCoinsRequest(BaseModel):
    amount: int = Field(gt=0)
    reason: str = Field(min_length=1, max_length=100)


class RechargeRequest(BaseModel):
    amount: int = Field(gt=0)
    reason: str = Field(default="manual_recharge", min_length=1, max_length=100)


class WalletMutationResponse(BaseModel):
    success: bool = True
    data: WalletBalance
    message: str
