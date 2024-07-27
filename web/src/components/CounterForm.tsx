import { useState } from "react";
import { CounterAttrs } from "../api/counters";
import { LoadingButton } from "@mui/lab";
import { Button, IconButton, MenuItem, Stack, TextField } from "@mui/material";
import { Cancel } from "@mui/icons-material";
import Select from "@mui/material/Select";
import Grid from "@mui/material/Unstable_Grid2";
interface Callbacks {
  cancelLoading: () => void;
}
export interface CounterFormProps {
  onSubmit: (params: Partial<CounterAttrs>, callbacks: Callbacks) => void;
  onCancel: () => void;
  defaultValues?: Partial<CounterAttrs>;
}
const CounterForm: React.FC<CounterFormProps> = ({
  onSubmit,
  onCancel,
  defaultValues = { target: 1, tally_method: "sum_7_day" },
}) => {
  const [loading, setLoading] = useState(false);
  const handleSubmit = (values: Partial<CounterAttrs>) => {
    const callbacks = {
      cancelLoading: () => setLoading(false),
    };
    setLoading(true);
    onSubmit(values, callbacks);
  };
  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSubmit({
            name: e.currentTarget.counter_name.value,
            notes: e.currentTarget.notes.value,
            tally_method: e.currentTarget.tally_method.value,
            target: e.currentTarget.counter_target.value,
          });
        }}>
        <Grid container spacing={2}>
          <Grid xs={12}>
            <TextField
              name="counter_name"
              label="Name"
              required
              defaultValue={defaultValues?.name}
            />
          </Grid>
          <Grid xs={12}>
            <TextField
              minRows={2}
              name="notes"
              defaultValue={defaultValues?.notes}
            />
          </Grid>
          <Grid xs={4}>
            <TextField
              name="counter_target"
              label="Target"
              defaultValue={defaultValues?.target}
              type="number"
            />
          </Grid>
          <Grid xs={8}>
            <Select
              name="tally_method"
              label="Tally Method"
              MenuProps={{ disablePortal: true }}
              defaultValue={defaultValues?.tally_method}>
              {[
                { value: "sum_1_day", label: "Sum 1 day" },
                { value: "sum_3_day", label: "Sum 3 days" },
                { value: "sum_7_day", label: "Sum 7 days" },
                { value: "sum_30_day", label: "Sum 30 days" },
                { value: "sum_90_day", label: "Sum 90 days" },
                { value: "sum_lifetime_day", label: "Sum lifetime" },
              ].map(({ label, value }) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid xs={12}>
            <Stack direction={"row"}>
              <Button variant="text" onClick={onCancel}>
                Cancel
              </Button>
              <LoadingButton
                variant="contained"
                color="primary"
                type="submit"
                loading={loading}>
                Submit
              </LoadingButton>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

export default CounterForm;
