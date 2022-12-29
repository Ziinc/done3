import { Button, Form, Input, Dropdown, InputRef } from "antd";
import { useEffect, useRef } from "react";
import { CounterAttrs } from "../api/counters";
interface Props {
  onSubmit: (params: Partial<CounterAttrs>) => void;
  defaultValues?: Partial<CounterAttrs>;
}
const CounterForm: React.FC<Props> = ({ onSubmit, defaultValues }) => {
  const nameInputRef = useRef<InputRef | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      nameInputRef.current?.focus({ cursor: "end" });
    }, 100);
    return () => clearTimeout(timer);
  }, [nameInputRef.current]);
  return (
    <Form
      name="counter"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      onFinish={onSubmit}
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
      <Form.Item label="Target" name="target">
        <Input ref={nameInputRef} type="number" defaultValue={1} />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CounterForm;
