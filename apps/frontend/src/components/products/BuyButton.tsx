import { Button, Snackbar } from "@mui/material";
import { useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

interface BuyButtonProps {
  productId: string;
  sellerAddress?: string;
  priceEth: number;
  quantity: number;
}

const BuyButton = ({ productId, priceEth, quantity }: BuyButtonProps) => {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string>("");

  const handleClose = () => setOpen(false);

  const handleBuy = async () => {
    if (!isConnected || !address) {
      openConnectModal?.();
      return;
    }

    setMessage("Đặt hàng demo thành công. Chức năng hợp đồng thông minh sẽ được bổ sung ở bước tiếp theo.");
    setOpen(true);
  };

  return (
    <>
      <Button variant="contained" size="large" fullWidth onClick={handleBuy}>
        Mua ({(priceEth * quantity).toFixed(2)} ETH)
      </Button>
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        message={message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
};

export default BuyButton;
