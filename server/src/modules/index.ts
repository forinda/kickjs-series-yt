import { defineModules } from '@forinda/kickjs'
import { AuthModule } from './auth/auth.module'
import { AccountModule } from './account/account.module'
import { UsersModule } from './users/users.module'
import { ArticlesModule } from './articles/articles.module'
import { CategoriesModule } from './categories/categories.module'
import { WriterRequestsModule } from './writer-requests/writer-requests.module'
import { EngagementModule } from './engagement/engagement.module'
import { FeedsModule } from './feeds/feeds.module'

// Every module the app mounts. `kick g module <name>` appends a `.mount(...)`
// line here; `kick rm module <name>` takes one out.
export const modules = defineModules()
  .mount(AuthModule())
  .mount(AccountModule())
  .mount(UsersModule())
  .mount(ArticlesModule())
  .mount(CategoriesModule())
  .mount(WriterRequestsModule())
  .mount(EngagementModule())
  .mount(FeedsModule())
