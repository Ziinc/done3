import { Button, Form, Input, Dropdown, InputRef } from "antd";
import { useEffect, useRef, useState } from "react";
import { CounterAttrs } from "../api/counters";
interface Callbacks {
  cancelLoading: () => void;
}
interface Props {
  onSubmit: (params: Partial<CounterAttrs>, callbacks: Callbacks) => void;
  defaultValues?: Partial<CounterAttrs>;
}
const CounterForm: React.FC<Props> = ({
  onSubmit,
  defaultValues = { target: 1 },
}) => {
  const nameInputRef = useRef<InputRef | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      nameInputRef.current?.focus({ cursor: "end" });
    }, 100);
    return () => clearTimeout(timer);
  }, [nameInputRef.current]);
  const handleSubmit = (values: CounterAttrs) => {
    const callbacks = {
      cancelLoading: () => setLoading(false),
    };
    setLoading(true);
    onSubmit(values, callbacks);
  };
  return (
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

      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CounterForm;
