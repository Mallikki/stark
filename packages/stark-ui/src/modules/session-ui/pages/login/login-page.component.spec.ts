/* tslint:disable:completed-docs */
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { CommonModule } from "@angular/common";
import {
	STARK_LOGGING_SERVICE,
	STARK_ROUTING_SERVICE,
	STARK_SESSION_SERVICE,
	STARK_USER_SERVICE,
	StarkUser,
	StarkRoutingService,
	StarkSessionService,
	StarkUserService
} from "@nationalbankbelgium/stark-core";
import {
	MockStarkLoggingService,
	MockStarkRoutingService,
	MockStarkSessionService,
	MockStarkUserService
} from "@nationalbankbelgium/stark-core/testing";
import { TranslateModule } from "@ngx-translate/core";
import { RawParams } from "@uirouter/core";
import { StarkLoginPageComponent } from "./login-page.component";
import Spy = jasmine.Spy;

describe("LoginPageComponent", () => {
	let component: StarkLoginPageComponent;
	let fixture: ComponentFixture<StarkLoginPageComponent>;

	const mockLogger: MockStarkLoggingService = new MockStarkLoggingService();
	const mockUserService: StarkUserService = new MockStarkUserService();
	const mockSessionService: StarkSessionService = new MockStarkSessionService();
	const mockRoutingService: StarkRoutingService = new MockStarkRoutingService();
	const mockUser: StarkUser = { firstName: "John", lastName: "Doe", username: "jdoe", uuid: "mock-uuid", roles: [] };

	const mockUserWithRoles: StarkUser = {
		firstName: "John",
		lastName: "Doe",
		username: "jdoe",
		uuid: "mock-uuid",
		roles: ["admin", "developer"]
	};

	beforeEach(async(() => {
		return TestBed.configureTestingModule({
			declarations: [StarkLoginPageComponent],
			imports: [CommonModule, TranslateModule.forRoot()],
			providers: [
				{ provide: STARK_LOGGING_SERVICE, useValue: mockLogger },
				{ provide: STARK_ROUTING_SERVICE, useValue: mockRoutingService },
				{ provide: STARK_USER_SERVICE, useValue: mockUserService },
				{ provide: STARK_SESSION_SERVICE, useValue: mockSessionService }
			]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(StarkLoginPageComponent);
		component = fixture.componentInstance;

		(<Spy>mockSessionService.login).calls.reset();
		(<Spy>mockRoutingService.navigateTo).calls.reset();
		(<Spy>mockRoutingService.navigateToHome).calls.reset();
	});

	describe("on initialization", () => {
		it("should set internal component properties", () => {
			expect(fixture).toBeDefined();
			expect(component).toBeDefined();
			expect(component.logger).not.toBeNull();
			expect(component.logger).toBeDefined();
			expect(component.routingService).not.toBeNull();
			expect(component.routingService).toBeDefined();
			expect(component.sessionService).not.toBeNull();
			expect(component.sessionService).toBeDefined();
			expect(component.userService).not.toBeNull();
			expect(component.userService).toBeDefined();
		});
	});

	describe("userProfilesAvailable", () => {
		it("should return FALSE if users array is undefined or empty", () => {
			component.users = <any>undefined;
			expect(component.userProfilesAvailable()).toBe(false);

			component.users = [];
			expect(component.userProfilesAvailable()).toBe(false);
		});

		it("should return TRUE if users array is NOT empty", () => {
			component.users = [mockUser];
			expect(component.userProfilesAvailable()).toBe(true);
		});
	});

	describe("getUserRoles", () => {
		it("should return empty string if the given user has no defined roles", () => {
			expect(component.getUserRoles(mockUser)).toBe("");
		});

		it("should return string with defined roles of the given user", () => {
			expect(component.getUserRoles(mockUserWithRoles)).toBe("admin,developer");
		});
	});

	describe("authenticateUser", () => {
		it("should log the user in and navigate to home or to the target state if defined", () => {
			component.authenticateUser(mockUser);

			expect(mockSessionService.login).toHaveBeenCalledTimes(1);
			expect(mockSessionService.login).toHaveBeenCalledWith(mockUser);
			expect(mockRoutingService.navigateTo).not.toHaveBeenCalled();
			expect(mockRoutingService.navigateToHome).toHaveBeenCalledTimes(1);

			(<Spy>mockSessionService.login).calls.reset();
			(<Spy>mockRoutingService.navigateToHome).calls.reset();
			const mockState: string = "mock-state";
			const mockStateParams: RawParams = {
				param: "mock-state-param"
			};
			component.targetState = mockState;
			component.targetStateParams = mockStateParams;

			component.authenticateUser(mockUser);

			expect(mockSessionService.login).toHaveBeenCalledTimes(1);
			expect(mockSessionService.login).toHaveBeenCalledWith(mockUser);
			expect(mockRoutingService.navigateTo).toHaveBeenCalledTimes(1);
			expect(mockRoutingService.navigateTo).toHaveBeenCalledWith(mockState, mockStateParams);
			expect(mockRoutingService.navigateToHome).not.toHaveBeenCalled();
			expect(component.logger.error).not.toHaveBeenCalled();
		});
	});
});
