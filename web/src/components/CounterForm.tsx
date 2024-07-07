import { Form, Input, InputRef, Select } from "antd";
import { useEffect, useRef, useState } from "react";
import { CounterAttrs } from "../api/counters";
import { LoadingButton } from "@mui/lab";
import { Box, IconButton } from "@mui/material";
import { Cancel } from "@mui/icons-material";
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
  const nameInputRef = useRef<InputRef | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      nameInputRef.current?.focus({ cursor: "end" });
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  const handleSubmit = (values: CounterAttrs) => {
    const callbacks = {
      cancelLoading: () => setLoading(false),
    };
    setLoading(true);
    onSubmit(values, callbacks);
  };
  return (
    <div>
      <Form
        name="counter"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        onFinish={handleSubmit}
        autoComplete="off"
        initialValues={defaultValues}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Counter name is required!" }]}
        >
          <Input ref={nameInputRef} placeholder="Name" />
        </Form.Item>
        <Form.Item label="Notes" name="notes">
          <Input.TextArea autoSize={{ minRows: 2, maxRows: 3 }} />
        </Form.Item>
        <Form.Item label="Target" name="target">
          <Input type="number" />
        </Form.Item>

        <Form.Item label="Tally Method" name="tally_method">
          <Select
            options={[
              { value: "sum_1_day", label: "Sum 1 day" },
              { value: "sum_3_day", label: "Sum 3 days" },
              { value: "sum_7_day", label: "Sum 7 days" },
              { value: "sum_30_day", label: "Sum 30 days" },
              { value: "sum_90_day", label: "Sum 90 days" },
              { value: "sum_lifetime_day", label: "Sum lifetime" },
            ]}
          />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <IconButton onClick={onCancel}>
            <Cancel />
          </IconButton>
          <LoadingButton
            variant="contained"
            color="primary"
            type="submit"
            loading={loading}
          >
            Submit
          </LoadingButton>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CounterForm;
