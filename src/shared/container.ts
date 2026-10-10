import { KidManageDB } from '@/infrastructure/database/DexieDatabase'
import { DexieTaskRepository } from '@/infrastructure/database/repositories/DexieTaskRepository'
import { DexiePetRepository } from '@/infrastructure/database/repositories/DexiePetRepository'
import { DexieRewardRepository } from '@/infrastructure/database/repositories/DexieRewardRepository'
import { DexiePointRepository } from '@/infrastructure/database/repositories/DexiePointRepository'
import { DexieSnapshotRepository } from '@/infrastructure/database/repositories/DexieSnapshotRepository'
import { DexieOutfitLogRepository } from '@/infrastructure/database/repositories/DexieOutfitLogRepository'
import { PointService } from '@/application/services/PointService'
import { TaskService } from '@/application/services/TaskService'
import { PetService } from '@/application/services/PetService'
import { OutfitService } from '@/application/services/OutfitService'
import { OUTFIT_CATALOG } from '@/domain/outfits/outfitCatalog'
import { PET_ASSET_FILES } from '@/presentation/pet/petAssetManifest'
import { RewardService } from '@/application/services/RewardService'
import { BackupService } from '@/application/services/BackupService'
import { JsonBackupAdapter } from '@/infrastructure/storage/JsonBackupAdapter'
import { AsyncMutex } from '@/shared/asyncMutex'

// Infrastructure: Database
const db = new KidManageDB()

// Infrastructure: Repository implementations
const taskRepo = new DexieTaskRepository(db)
const petRepo = new DexiePetRepository(db)
const rewardRepo = new DexieRewardRepository(db)
const pointRepo = new DexiePointRepository(db)
const snapshotRepo = new DexieSnapshotRepository(db)
const outfitLogRepo = new DexieOutfitLogRepository(db)
const backupAdapter = new JsonBackupAdapter(db)
const mutationMutex = new AsyncMutex()

// Application: Services (injected with Repository interfaces)
export const pointService = new PointService(pointRepo)
export const taskService = new TaskService(taskRepo, pointService, snapshotRepo)
export const petService = new PetService(petRepo, pointService, mutationMutex)
export const outfitService = new OutfitService(
  petRepo,
  outfitLogRepo,
  pointService,
  mutationMutex,
  OUTFIT_CATALOG,
  PET_ASSET_FILES,
)
export const rewardService = new RewardService(rewardRepo, pointService)
export const backupService = new BackupService(backupAdapter)
