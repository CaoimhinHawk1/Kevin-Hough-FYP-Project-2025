import {remultExpress} from "remult/remult-express"
import { Task } from "../shared/task"

export const api = remultExpress({
  entities:[Task]
})
