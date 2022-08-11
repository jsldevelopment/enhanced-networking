import Entity from './Entity.model'
export default interface User {
    id: string,
    username: string,
    displayName: string,
    updated: number,
    img: string,
    entities: Entity[],
    follows: string[],
    blocks: string[]
}