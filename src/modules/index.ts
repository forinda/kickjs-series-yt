import { defineModules } from '@forinda/kickjs'
import { CategoryModule } from './category/category.module'
import { AuthModule } from './auth/auth.module'
import { TasksModule } from './tasks/tasks.module'

// Every module the app mounts. `kick g module <name>` appends a `.mount(...)`
// line here; `kick rm module <name>` takes one out.
export const modules = defineModules()
  .mount(CategoryModule())
  .mount(AuthModule())
  .mount(TasksModule())
