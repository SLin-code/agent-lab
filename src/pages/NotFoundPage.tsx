import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="not-found">
      <span>404</span>
      <h1>这条路径还没有节点</h1>
      <p>返回课程地图，选择一个已经开放的实验。</p>
      <Link className="button button-primary" to="/">
        返回学习路径
      </Link>
    </main>
  );
}
