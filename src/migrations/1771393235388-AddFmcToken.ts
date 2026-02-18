import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFmcToken1771393235388 implements MigrationInterface {
    name = 'AddFmcToken1771393235388'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "fcmToken" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "fcmToken"`);
    }

}
