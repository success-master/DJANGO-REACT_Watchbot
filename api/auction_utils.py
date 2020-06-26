from auction.models import Auction, Notification, TransactionsSmart2Pay, AuctionWinner
from auction.fee_utils import calc_vat_auction


def completePayment(auction: Auction, auction_winner: AuctionWinner):
    notification = Notification(
        user=auction.owner.user if auction.type == "put" else auction_winner.offer.user,
        auction=auction,
        mine_follow=1,
        notification_type=7,
        reference=auction.reference
    )
    notification.save()
    if auction.type == "put":
        retailer = auction.owner
    else:
        retailer = auction.winner
    wb_transaction = TransactionsSmart2Pay(
        amount=auction.wb_fee,
        currency="EUR",
        order_id=auction,
        order_line_id=str(auction.pk) + '-1',
        payment_state="PAID",
        shop_id="1234",
        shop_name="Watchbot",
        transaction_type="ORDER_AMOUNT",
        vat_rate=0,
    )
    wb_transaction.save()
    retailer_transaction = TransactionsSmart2Pay(
        amount=auction_winner.price - auction.wb_fee,
        currency="EUR",
        order_id=auction,
        order_line_id=str(auction.pk) + '-2',
        payment_state="PAID",
        shop_id=retailer.shop_id,
        shop_name="Retailer " + str(retailer.pk),
        transaction_type="ORDER_AMOUNT",
        vat_rate=calc_vat_auction(auction),
    )
    retailer_transaction.save()
    other_transaction = TransactionsSmart2Pay(
        amount=auction_winner.offer.shipping + auction_winner.offer.duties + auction_winner.offer.insurance,
        currency="EUR",
        order_id=auction,
        order_line_id=str(auction.pk) + '-3',
        payment_state="PAID",
        shop_id="6221",
        shop_name="WebInterpret",
        transaction_type="ORDER_AMOUNT",
        vat_rate=0,
    )
    other_transaction.save()