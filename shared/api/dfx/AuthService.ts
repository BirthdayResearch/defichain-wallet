import jwtDecode from 'jwt-decode'
import { Observable, ReplaySubject } from 'rxjs'
import { UserRole } from './models/User'
import { StorageService } from './StorageService'

const SessionKey = 'session'

export interface Credentials {
  address?: string
  signature?: string
}

export interface ISession {
  accessToken?: string
}

interface JWT {
  exp: number
  iat: number
  address: string
  role: UserRole
}

export class Session implements ISession {
  public accessToken?: string
  public address?: string
  public role?: UserRole
  public expires?: Date

  public get isLoggedIn (): boolean {
    return Boolean(this.accessToken)
  }

  public get isBetaUser (): boolean {
    return [UserRole.Admin, UserRole.BETA].includes(this.role ?? UserRole.Unknown)
  }

  public get isExpired (): boolean {
    return this.expires != null && Date.now() > this.expires.getTime()
  }

  constructor (session?: ISession) {
    this.accessToken = session?.accessToken
    if (this.accessToken != null) {
      const jwt: JWT = jwtDecode(this.accessToken)
      this.address = jwt.address
      this.role = jwt.role
      this.expires = new Date(jwt.exp * 1000)
    }
  }
}

class AuthServiceClass {
  private readonly session$ = new ReplaySubject<Session>()

  constructor () {
    this.Session
      .then((session) => this.session$.next(session))
      .catch(() => this.session$.next(new Session()))
  }

  public get Session$ (): Observable<Session> {
    return this.session$
  }

  public get Session (): Promise<Session> {
    return StorageService.getValue<ISession>(SessionKey).then((session) => new Session(session))
  }

  public async updateSession (session: ISession): Promise<void> {
    return await StorageService.storeValue(SessionKey, session).then(() => this.session$.next(new Session(session)))
  }

  public async deleteSession (): Promise<void> {
    return await this.updateSession({
      accessToken: undefined
    })
  }
}

export const AuthService = new AuthServiceClass()
