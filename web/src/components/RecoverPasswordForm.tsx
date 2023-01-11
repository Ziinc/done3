import { Button, Form } from "antd";
import Input from "rc-input";
import { useState } from "react";

interface Props {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  tokenType: string;
  type: string;
  onSubmit: (attrs: Attrs) => void;
}
interface Attrs {
  password: string;
}
const RecoverPasswordForm: React.FC<Props> = ({
  accessToken,
  expiresIn,
  refreshToken,
  tokenType,
  type,
}) => {
  const [loading, setLoading] = useState(false);
  const handleSubmit = () => {
    setLoading(true);
  };

  return (
    <Form
      name="counter"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      onFinish={handleSubmit}
      autoComplete="off"
    >
      <Form.Item
        label="New password"
        name="password"
        rules={[{ required: true, message: "Counter name is required!" }]}
      >
        <Input placeholder="Name" />
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RecoverPasswordForm;
