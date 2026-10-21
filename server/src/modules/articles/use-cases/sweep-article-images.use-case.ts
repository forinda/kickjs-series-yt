import { Autowired, Service } from '@forinda/kickjs'
import { ArticleImagesService } from '../article-images.service'

/** Admin maintenance: remove article images that were uploaded but never kept. */
@Service()
export class SweepArticleImagesUseCase {
  @Autowired() private readonly images!: ArticleImagesService

  execute() {
    return this.images.sweep()
  }
}
