export default abstract class DB<T> {

    abstract tableName: string

    abstract write(input: T): void

    abstract read(id: string): void

}