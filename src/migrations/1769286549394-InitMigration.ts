import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1769286549394 implements MigrationInterface {
    name = 'InitMigration1769286549394'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "role_menus" ("idRole" integer NOT NULL, "idMenu" integer NOT NULL, CONSTRAINT "PK_05ed70acfbde40502210b348658" PRIMARY KEY ("idRole", "idMenu"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e0f7a71d4adcf65d47d9cf0ed0" ON "role_menus" ("idRole") `);
        await queryRunner.query(`CREATE INDEX "IDX_39d3ead898d70d45c38a99123c" ON "role_menus" ("idMenu") `);
        await queryRunner.query(`CREATE TABLE "user_roles" ("idUser" integer NOT NULL, "idRole" integer NOT NULL, CONSTRAINT "PK_63eeedf0e95756d46ed20d8e3e8" PRIMARY KEY ("idUser", "idRole"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f0ece3c0180c0c8013db8cf288" ON "user_roles" ("idUser") `);
        await queryRunner.query(`CREATE INDEX "IDX_8fffc12dccd2d7b07f608f4616" ON "user_roles" ("idRole") `);
        await queryRunner.query(`ALTER TABLE "role_menus" ADD CONSTRAINT "FK_e0f7a71d4adcf65d47d9cf0ed09" FOREIGN KEY ("idRole") REFERENCES "role"("idRoles") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "role_menus" ADD CONSTRAINT "FK_39d3ead898d70d45c38a99123c2" FOREIGN KEY ("idMenu") REFERENCES "menu"("idMenu") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_f0ece3c0180c0c8013db8cf2880" FOREIGN KEY ("idUser") REFERENCES "user"("idUser") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_8fffc12dccd2d7b07f608f46166" FOREIGN KEY ("idRole") REFERENCES "role"("idRoles") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_8fffc12dccd2d7b07f608f46166"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_f0ece3c0180c0c8013db8cf2880"`);
        await queryRunner.query(`ALTER TABLE "role_menus" DROP CONSTRAINT "FK_39d3ead898d70d45c38a99123c2"`);
        await queryRunner.query(`ALTER TABLE "role_menus" DROP CONSTRAINT "FK_e0f7a71d4adcf65d47d9cf0ed09"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8fffc12dccd2d7b07f608f4616"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f0ece3c0180c0c8013db8cf288"`);
        await queryRunner.query(`DROP TABLE "user_roles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_39d3ead898d70d45c38a99123c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e0f7a71d4adcf65d47d9cf0ed0"`);
        await queryRunner.query(`DROP TABLE "role_menus"`);
    }

}
