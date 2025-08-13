import { Button } from "@arco-design/web-react";
import { useNavigate } from "react-router";

function Homepage() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Homepage</h1>
      <Button onClick={() => navigate("/viewer")}>Go to Viewer</Button>
      <Button onClick={() => navigate("/fabric-demo")}>
        Go to Fabric Demo
      </Button>
    </div>
  );
}

export default Homepage;
