package com.tripsplit.expense;

import java.math.BigDecimal;

public class ExpenseSplit {

    private String memberName;
    private BigDecimal amount;
    private boolean settled;

    public ExpenseSplit() {}

    public ExpenseSplit(String memberName, BigDecimal amount) {
        this.memberName = memberName;
        this.amount = amount;
        this.settled = false;
    }

    public String getMemberName() { return memberName; }
    public void setMemberName(String memberName) { this.memberName = memberName; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public boolean isSettled() { return settled; }
    public void setSettled(boolean settled) { this.settled = settled; }
}
