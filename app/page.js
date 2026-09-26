import TaskListPage from "@/components/tasks/TaskListPage";
import { getTaskList } from "@/lib/service";
import { todayKey } from "@/lib/dates";

// サーバー側で初回データを取得して渡し、クライアントの fetch 待ちなしで初回描画する
export default async function HomePage() {
  const tasks = await getTaskList(todayKey());
  return <TaskListPage initialTasks={tasks} />;
}
