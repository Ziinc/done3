import { styled } from "@mui/system";
import Button from "@mui/material/Button";

const ActionButton = styled(Button)({
  fontSize: 14,
  fontWeight: 600,
  paddingLeft: 8,
  paddingRight: 8,
  ".MuiButton-startIcon": {
    marginRight: 3,
  },
});

export default ActionButton;
