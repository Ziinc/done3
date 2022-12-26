import { Button, Form, Input, Dropdown } from "antd";
import { Counter, CounterAttrs } from "../api/counters";
interface Props {
  onSubmit: (params: Partial<CounterAttrs>) => void;
  defaultValues?: Partial<CounterAttrs>;
}
const CounterForm: React.FC<Props> = ({ onSubmit, defaultValues }) => (
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
      <Input placeholder="Name" />
    </Form.Item>

    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
      <Button type="primary" htmlType="submit">
        Submit
      </Button>
    </Form.Item>
  </Form>
);

export default CounterForm;
