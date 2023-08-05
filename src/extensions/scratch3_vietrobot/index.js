const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const formatMessage = require('format-message');
const uid = require('../../util/uid');
const BT = require('../../io/bt');
const Base64Util = require('../../util/base64-util');
const MathUtil = require('../../util/math-util');
const RateLimiter = require('../../util/rateLimiter.js');
const log = require('../../util/log');

/**
 * Icon png to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAEHtJREFUeJztXflXVEcWzsz8A3PmnDnz4/w059ALzeaGsggoqLjvJkTcwGhGREXFPUaNcUONEjGKG+K+xzUq7iZGZVzjilFWUdlFWYQ79d3mVffDbuhuFpuj75zv2LxX9V7V976qunXr1vOzz6wcLjue/VNgosApgWyBSgH6SFAlkCdwWWC+wH+s8WSJuL8LfCuQ7wQVcRaUCSQK/Ls+8lwErjpBgZ0VGQLBAhbJ09QksPmGrrvS6fNTzyn60ksadiaXvPZkfOgKNgdKBHrUJu8fAtftudFwQVjqyzLKffOO7hWUU1ZpJT0orKAZv+d96Ao2B14IaM0JXGDPDb46/4KKK6po1tU80u40ntMIRJx7Qc8FoUtuFHzoCjYHDivk/Uug0NaMbfZlUE7pO5r86yuL1/scz6G376op9Gj2h65gU6NaoDMInGpPxkihsmclleS+O91qmjNZbyju5kehwp0g8Kw9mb5LzadDT1/Xm2bfk7rT1EZboexJl181CBjMxl1Uw3t/pnyGbtHPpFu4n6FZl9oYBOaDwFx7Ms0Ug8SlnLd1pln7RxFtvZ9vV2H6/5JDTXEMTcmVz/Ds0JG8vLwYHqGDSLP+fw0mEQRW25Oh+7FsKhEDSNDPWRav68Sggj5yypJ40iQ9bDYCi4qKaP78+TRq1Cjav39/vQQCnoFdSbPpboMJtCsDRt2DoglfECr03q+2+2AHbnlQTPfu3aN23t7kOjm+WQgsLS2lIUOGkFv4ZNJPW0cenXpQcnJyvQSyEoN7k3bNb81HINB6bwadz35Lj4oqaP71fBp1NpemX8mj33PL6HHaE+rZs6excN0GkEtymkMEbty4kcaNG0dRUVH1IjIykrx8A6SadPN305gxY2wiUDZnB/tEhwgEMAv5euMRunDhAmVkZNDNmzdZCai0LFyrVqLDPugQgdOnT6fo6GjatWtXvdiwYQO18/Ej7arz5LL9KRm+/o6mTZvG94HBXx+BTGKn7g41Z4cJ5Oac8Bt5tW5NrQVQiL1799Lp06dVBXMf9JVNKrRE4Lp162xqwlVVVZSYmEhtAjqTR5e+FBzShe7fv8/X0DpsIRBwpCk3iEDAfWCkLED//v2poKCAQkND1SoU5kNTEqgcT58+pYsXL1JZWZk85/QEaleeEQ9vJQuxbds2SklJUatw4Oh679PvRN0EismNmG+/sxthp587N4GswgEmFfbq1YvKy8tpwIABpsKJJl5f4Xoez66TwKzXlQ0up9MSqPtuHzdVpSBHjx6lPXv2qArnFhb9iUCrSH5MHt0Hy4J07dqVXr16RWFhYWYqbCMGnSufCLQGvbC9zPvCEydO0IEDB1QFNIxd8IlA6ypMY6teKUx4eDhPr7p162aaOvl1Egbr9U8EWoPr1ATZF8I23LdvH23atIlamfWPhtFzPxFoDbDkPYJ7yQKhD3z+/Dn16dPHpMKOwaTZ/EeDCERfqp+eaDe82nVwbgJZhbFrZYGgPNiEO3fuVBXUkpPBHgL1s5PqJMIWBAUFscnldARCXZ7tfWWhxo4dSy9fvqSOHU3NxzOgi0h3zyKBmJaBuMDAQOrRowedOXOmUQnES122bBnl5ORQvpg1HT58mHx9fZ2HQFZh1BJVoU+dOkVbtmxRnUOTskQgbEhPvyDS/nCW7ct2vv509+5duwj09/en4OBgfgm1MXLkSCopr+Spo+eedLqTX05r1qxxLgI1W+6LDttfNSK/ffuWQkJC5DmPLv3IZfuf7xEIdRjGzJPn3XuF8WCUaQeBo0eP5nvBFs3OzlYB5x4WVpCmZjUR3vMjR444F4GAYdRMVaVu3LhB8fHxahV+u+M9AkGWR0hv0v74K2njTlLbgM50/fp1uxQICwCOheXLl1P79u1VGDhwIBWUlFLsb69oyKnn9KS4ghYtWuR8BGpXXyBPbx/ViIx+p0uXLiYVdu0n03c7mk1V1UQVFRU0d+5c8vHvSB0Dg3hKiH7RHgUCUPKjR4+obdu2710bP348paWl0YsXL7j5KmmcikB2bEbMVhUcSlq/fr3qnG7ZCSMpu9LpxiujG6q6upoHnvz8fIdHYXQXmZmZ3JwtXW/Xrh35+PiozjkXgVDhqvPk1cakgJiYGH7r6OSVc+aurmlXXrEKLR3mBOqWHiP3IV+/B8+AEBUhUNexY8ekw5dV3+Nzi3kBTeIN5yLQZcdTch8QoXrrcHguXbq0lgqPc3rDbpMK6yLQGvTfJIuZkIksOHYLCwtVTg23YVMatY5NTGCNq6tNO1kBLAJBhZ06dTJV6osolQodJRDzcYza5i8HCty9e7fJBhXWQWOsBzcbgTBV3PuPkhVAh431iri4OFOlvDuQJuF3Tu8mVFhQXuUYgVDhnK0qAiMiIth0Me/vXMcvbUEEsgr3qyoFFaKDh1khVfjlBJkeS6WOEggVYqZjPvPAQtfq1aubRIXNQqDLtifkERSqUuHt27fZ1DCp0Jc0P13j9Figr61Ce7wxrrE/qV4Ylkcxqnt7e5tUGLO6BREooJ+3S1UpOAvQtMztNEPUYpl+/b0ihwnEC/P076RSYVZWFs2caTLuoVLzmZDTEwi70KNzT9WI/ODBA5o3b56pUnC4rjX2hSGHsyivzKTCTDv9ga4Tlqte2IwZMyg1NZWfK1U46YcWRCAqJQpsXinYhYhqmDx5Mg0aNIiVonTwiHjddL/YMQUiv+gOPP07q14Y5sJoztIm7NSd1dpiCNRsvE0ewSYVokkhVPh05hvKLSmjxYsXsyfGZesjTt9ZqLC0stohAvmFTVypemEJCQl05coVlYdcP3d7yyGQKxWzShYec2MERUJt4Sm59Cwjkx2diLBSVHhKkOsogVh/MfdN9u3bl21QhL9h0Qv2YcyyBNLvbEEEajbeYTMC0ysswPc+nsPnEW/4ssC4COXpGyib1pcpz6nsXbXDayJuw6bKgQRuq9dC8VsfFlOsMNhX3ymkF2/e8ewHEbItgkAA/j5UCrZZWlEFJdwtojt5ZZSUlCTnrfpZm2X64+mlDhOI+TheGJYVruS+pYBD6sBQw6502p1WQrfyyuuM+3YqAmHEolIwYTAvhjJWrVqlmi249x4qo7pGnM1t0KpcSOwyKq+stLpzAOrDKI/tGy2CQH7zI2fU7ZISStTPSTISLvqolKw3Dj8r9nIu3RYKqyvNiluFtPlBccshEGYG/Hp1QRd3UqbHiOzosxak5tO57LpfAJwY9u4s+KAENiew3eHP4rq7AKgvXgwqnwi0AK896fS6soo3CVm6HnIki4rE6Nzvl5xPBFrDxMsvKUMMFFFCjYjvxjnsOMDy5h3RPyYJ00bjgD340RAIYCcp9rCgOcNAB3GF5VW8tKlz0Jj+qAgEsEUDTfmbq3k8C/I9mNmg+9lMoJ94kP9HBFsVaTOBcbcKeOrzscDWqd1H14QbGzYT6PbFeF4caj80igIjpzA8BkSQz7Bo+XeH8PEUNHoqw2vQaPIdPkFeU64HRExWnVPO49667w/xsxDhpdlwy4iNt6V7SwEiuxB8hC0WiMPh89ufivS3Tfmw66iWrw/ntStTOGpCuSfuJfOYAUuyjUogPCSYYmHO+vr1awbcQydPnuTfWHNABBa2ewFwkGINWEkLYANgXl6e6hywY8cOowNh5ibjy8IiubePER38eMFcH/sTX9MtOcpBmtKL7d+ZdAsPMGFw08t8Ph15r542/hLn009bz/cy5mtFHiF9+BoWs2QeM2hqvbRGI3DOnDnSSzxhwgS6desW/4afDWEbyjF48GC6du0a/64UE3kscMPbgnRwYykH4qixOcecQPf+NYvxbduTR+ceNYtOolJJD+QSKeJqlJ0BHj2GSDcZ/x0UKsobYFxniZhFLkkPycu7g3RSePoE1KxHjye3oZPIq72faQ7e1ptDgWurvtEIHDFihKw8VtWwPIkD6xtwT1kiEP+aOwqgOOVAzJ70DtciEEpznWaKpdGuOieXLN2Gx5JhzHypQnae1hCIa27DjX5AREZo1/xqWgeZuIJ3ZxpfQn9+HmJiLC1sNQmBCJdQFLR582Z688boMT579qxVArF/GDGC8DbbRaB4pgyTw26nhCuy+aoI9A0izdqrkkD3wWPJve8IY7rwGGOMjjmBinJFM252Av38/Lgfw4GwCeXYvn27VQKVQ1lWtJVAiTZteQurZsNNmwiU/aNoxogxtEagJxaVmptA4OHDh1JZyoHt9tYILC4u5t+Il7ZLgYIQbJdVVtDYEWuLAkU/h+bJv8W9tCtOOxeBSuB3SUmJJAJNtGn6wHWmPvCHczYRaN4HenYM4e22Fptwl74fhkD0feYH9udif5w1AhHeC6IUl709BPL+DnMCA7uaETjPbBBJVRMYPlneQxf3i4nACSvYvGEC8UmCD0HglClTVATCBgQ59fWBWE5sCIHwYmOA4GuCSM9A4zYy9z7DhB1oMmPY3qsJqYPKVCYONgLVbLhRYgWbnUBsUHn27Bmlp6czLl26xMuGCxcu5EgDoF+/frxlQUkDYFs+8iNyVDlnHq0qDWlRMfR57j3DeOEbv7kPTLxJ2h8vi/NfkKew3bDm69HzczZvMHuBeaKkZYQOJP2cZL6nbvERHnWNxjn61jHGWc4O4/KCksd1ypqmJ7AugEjzlX97oBBYL8ymbXYFCCWnmaZ5222bqjUagbolR3jK1JSwtpPTmfHJG+OsBGpXX2TTwtH8MJq1y0/x6Mrfg7Enr3huI31czCYCixyupFK55MfGc6I/wnRLG3+RY5XR7M03FSq/FXeU0W1Ucw0DBA8G90iz5R7pvj/IIyIGDbitLD0Poys8Ktqa+Gr58kQZlGhX+TLEfFhVftEHYvRlb00DQtxAYKojGWGcIohRP309ucbEcyH0MzbwVlaE2Lp/EWVMM+VHmQeRWZhNGMYtMqaNWsK+OdhprtHLxLlEMWVbyHkQJ+gWNp4jW7F9gdPw8xKNMYRJD3m+q49dy3nRh8qyLT3Gsw/+Wwwchv8uFPheFRetn7WppqxrjSOvY4NKGQiMc4RATNKVjcxuo2aQbsFe6bNjssRv3aJDTJo8J2YBmFlAOYpiMSK6RsfJCkBNyAOlgUidaMaIUoBhrDg5QQ6eh8grvs/Wx1wGSeCSo5yP/xYv1jBusXF3aE2sDT9TECcV6vionAIC3Vwc+Mi24au5XElA/+1ObiLmNhSCuHWLDzNpSpMxjJ3PFZFKEJXDyMsE1jQjKNIygTGykrDp4L12i5gt7+M2cvr7BCJ90gPuE/Wztxi/4wUTSHQT5pu+ubk7Fi89RvmO6g57M2uXn+QAIVbVxJVcMFQUJLlGLeXNM2hKINVVKABuKTRdFN5txDRynbSKKw0yMeC4ieu4jyFyNhPHRAqVQG1ownhBBiWNuA8rS/n+An5Hzn6PQOVlGSLn8HXtihQZF81lFXNpdAf41oMD5P0h8BfzD3C/tPsmeMO1PyyGN7mt1jmkqd1E3vP4PjUNRnU+r540ojnj8yqa9al1l1Mpq42f56uFcoHQ2t+S7i/wxoGbORWgcN3S4035DHxnH5/K/2ttAoEwFzs+ifwRosLF+J8T/M3at/QBL4HzTlBYZ8Mjge4utZVXx39MMFDgsECpExT+QwGKuygQ7WJFdf8HRxba/AGOOYMAAAAASUVORK5CYII=';

/**
 * String with expected bluetooth pairing pin.
 * @readonly
 */
const PairingPin = '1234';

if (!crossOriginIsolated) {
    throw new Error('Cannot use SharedArrayBuffer');
}

const sharedBuffer = new SharedArrayBuffer(16);
const notifyFlags = new Int32Array(sharedBuffer);

/**
 * A maximum number of BT message sends per second, to be enforced by the rate limiter.
 * @type {number}
 */
const BTSendRateMax = 40;

const MSG_CMD_ID = {
    PUT_LEDRGB       : 0x00,
    PUT_LEDTRAFFIC   : 0x01,
    PUT_DCMOTOR      : 0x02,
    PUT_LCD          : 0x03,
    PUT_BUZZER       : 0x04,
    PUT_SERVO        : 0x05,
    GET_ULTRASONIC   : 0x06,
    GET_GAS          : 0x07,
    GET_PHOTORES     : 0x08,
    GET_TEMPURATURE  : 0x09,
    GET_IR_SENSOR    : 0x0A,
    GET_VAR_RES      : 0x0B,
    GET_BUTTON_STATE : 0x0C
};

const CMD_PUT_DCMOTOR = {
    PORT_DIRECTION      : 0x00,
    PORT_POWER          : 0x01,
    PORT_FULL_CTRL      : 0x02,
    ALL_PORTS_FULL_CTRL : 0x03
};

class VietRobot {

    constructor (runtime, extensionId) {

        /**
         * The Scratch 3.0 runtime used to trigger the green flag button.
         * @type {Runtime}
         * @private
         */
        this._runtime = runtime;
        // this._runtime.on('PROJECT_STOP_ALL', this.stopAll.bind(this));

        /**
         * The id of the extension this peripheral belongs to.
         */
        this._extensionId = extensionId;

        /**
         * The polling interval, in milliseconds.
         * @type {number}
         * @private
         */
        this._pollingInterval = 500;

        /**
         * The polling interval ID.
         * @type {number}
         * @private
         */
        this._pollingIntervalID = null;

        /**
         * The counter keeping track of polling cycles.
         * @type {string[]}
         * @private
         */
        this._pollingCounter = 0;

        /**
         * The Bluetooth socket connection for reading/writing peripheral data.
         * @type {BT}
         * @private
         */
        this._bt = null;
        this._runtime.registerPeripheralExtension(extensionId, this);

        /**
         * A rate limiter utility, to help limit the rate at which we send BT messages
         * over the socket to Scratch Link to a maximum number of sends per second.
         * @type {RateLimiter}
         * @private
         */
        this._rateLimiter = new RateLimiter(BTSendRateMax);

        this.reset = this.reset.bind(this);
        this._onConnect = this._onConnect.bind(this);
        this._onMessage = this._onMessage.bind(this);
        this._pollValues = this._pollValues.bind(this);
    }

    /**
     * Called by the runtime when user wants to scan for an EV3 peripheral.
     */
    scan () {
        if (this._bt) {
            this._bt.disconnect();
        }
        this._bt = new BT(this._runtime, this._extensionId, {
            majorDeviceClass: 31,
            minorDeviceClass: 0
        }, this._onConnect, this.reset, this._onMessage);
    }

    /**
     * Called by the runtime when user wants to connect to a certain EV3 peripheral.
     * @param {number} id - the id of the peripheral to connect to.
     */
    connect (id) {
        if (this._bt) {
            this._bt.connectPeripheral(id, PairingPin);
        }
    }

    /**
     * Called by the runtime when user wants to disconnect from the EV3 peripheral.
     */
    disconnect () {
        if (this._bt) {
            this._bt.disconnect();
        }

        this.reset();
    }

    /**
     * Reset all the state and timeout/interval ids.
     */
    reset () {

        if (this._pollingIntervalID) {
            window.clearInterval(this._pollingIntervalID);
            this._pollingIntervalID = null;
        }
    }

    /**
     * Called by the runtime to detect whether the EV3 peripheral is connected.
     * @return {boolean} - the connected state.
     */
    isConnected () {
        let connected = false;
        if (this._bt) {
            connected = this._bt.isConnected();
        }
        return connected;
    }

    /**
     * Send a message to the peripheral BT socket.
     * @param {Uint8Array} message - the message to send.
     * @param {boolean} [useLimiter=true] - if true, use the rate limiter
     * @return {Promise} - a promise result of the send operation.
     */
    send (message, useLimiter = true) {
        if (!this.isConnected()) return Promise.resolve();

        if (useLimiter) {
            if (!this._rateLimiter.okayToSend()) return Promise.resolve();
        }

        return this._bt.sendMessage({
            message: Base64Util.uint8ArrayToBase64(message),
            encoding: 'base64'
        });
    }

    generateCommand (cmdId, byteCommands, allocation = 0) {

        console.log(typeof byteCommands);

        // Header (Bytes 0 - 6)
        let command = [];
        command[2] = cmdId;

        // Bytecodes (Bytes 7 - n)
        command = command.concat(byteCommands);

        // Calculate command length minus first two header bytes
        const len = command.length - 2;
        command[0] = len & 0xFF;
        command[1] = len >> 8 && 0xFF;

        return command;
    }

    /**
     * When the EV3 peripheral connects, start polling for sensor and motor values.
     * @private
     */
    _onConnect () {
        console.log("_onConnect called")
        this._pollingIntervalID = window.setInterval(this._pollValues, this._pollingInterval);
    }

    /**
     * Poll the EV3 for sensor and motor input values, based on the list of
     * known connected sensors and motors. This is sent as many compound commands
     * in a direct command, with a reply expected.
     *
     * See 'EV3 Firmware Developer Kit', section 4.8, page 46, at
     * https://education.lego.com/en-us/support/mindstorms-ev3/developer-kits
     * for a list of polling/input device commands and their arguments.
     *
     * @private
     */
    _pollValues () {
        if (!this.isConnected()) {
            window.clearInterval(this._pollingIntervalID);
            return;
        }

        //console.log("_pollValues called.");
        //this.send(new TextEncoder("utf-8").encode("Request"));

        this._pollingCounter++;
    }

    _onMessage (params) {
        const message = params.message;
        const data = Base64Util.base64ToUint8Array(message);
        console.log("_onMessage called: ");
        console.log(data);

        // Atomics.notify(notifyFlags, 0, 1);
    }
}

class Scratch3VietRobotBlocks {


    /**
     * @return {string} - the name of this extension.
     */
    static get EXTENSION_NAME () {
        return 'VietRotbot Edu';
    }
    /**
     * The ID of the extension.
     * @return {string} the id
     */
    static get EXTENSION_ID () {
        return 'vietrobot';
    }

    /**
     * Creates a new instance of the EV3 extension.
     * @param  {object} runtime VM runtime
     * @constructor
     */
    constructor (runtime) {
        /**
         * The Scratch 3.0 runtime.
         * @type {Runtime}
         */
        this.runtime = runtime;

        // Create a new EV3 peripheral instance
        this._peripheral = new VietRobot(this.runtime, Scratch3VietRobotBlocks.EXTENSION_ID);

    }

    /**
     * Define the EV3 extension.
     * @return {object} Extension description.
     */
    getInfo () {
        return {
            id: Scratch3VietRobotBlocks.EXTENSION_ID,
            name: Scratch3VietRobotBlocks.EXTENSION_NAME,
            blockIconURI: blockIconURI,
            showStatusButton: true,
            blocks: [
                {
                    opcode: 'motorSetPower',
                    text: formatMessage({
                        id: 'vietrobot.motorSetPower',
                        default: 'motor[PORT] set power[POWER]%',
                        description: 'set power for a motor'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'PORT_MENU',
                            defaultValue: '0'
                        },
                        POWER: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'motorSetOrientation',
                    text: formatMessage({
                        id: 'vietrobot.motorSetOrientation',
                        default: 'motor[PORT] set orientation[ORIENTATION]',
                        description: 'set motor rotation direction'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'PORT_MENU',
                            defaultValue: '0'
                        },
                        ORIENTATION: {
                            type: ArgumentType.STRING,
                            menu: 'orientations',
                            defaultValue: 'CW'
                        }
                    }
                },
                {
                    opcode: 'motorFullControl',
                    text: formatMessage({
                        id: 'vietrobot.motorFullControl',
                        default: 'motor[PORT] set orientation[ORIENTATION] set power[POWER]',
                        description: 'set motor power and orientation'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'PORT_MENU',
                            defaultValue: '0'
                        },
                        ORIENTATION: {
                            type: ArgumentType.STRING,
                            menu: 'orientations',
                            defaultValue: 'CW'
                        },
                        POWER: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'displayingLedRGB',
                    text: formatMessage({
                        id: 'vietrobot.displayingLedRGB',
                        default: 'led RGB[COLOR]',
                        description: 'Adjust led rgb [COLOR]'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        COLOR: {
                            type: ArgumentType.COLOR
                        }
                    }
                },
                {
                    opcode: 'servoAngle',
                    text: formatMessage({
                        id: 'vietrobot.servoAngle',
                        default: 'Servo port[PORT]s1:[ANGLE_1]s2:[ANGLE_2]s3:[ANGLE_3]',
                        description: 'Control servos'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'PORT_MENU',
                            defaultValue: '0'
                        },
                        ANGLE_1: {
                            type: ArgumentType.ANGLE
                        },
                        ANGLE_2: {
                            type: ArgumentType.ANGLE
                        },
                        ANGLE_3: {
                            type: ArgumentType.ANGLE
                        }
                    }
                },
                {
                    opcode: 'ultraDistance',
                    text: formatMessage({
                        id: 'vietrobot.ultraDistance',
                        default: 'measure distance[PORT]in cm',
                        description: 'Get Ultrasonic value'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'PORT_MENU',
                            defaultValue: '0'
                        },
                    }
                },
                {
                    opcode: 'ledTrafficCmd',
                    text: formatMessage({
                        id: 'vietrobot.ledTrafficCmd',
                        default: 'Led traffic[PORT]Red[RED]Yellow[YELLOW]Green[GREEN]',
                        description: 'Control led traffic'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'PORT_MENU',
                            defaultValue: '0'
                        },
                        RED: {
                            type: ArgumentType.STRING,
                            menu: 'ledState',
                            defaultValue: 'OFF'
                        },
                        YELLOW: {
                            type: ArgumentType.STRING,
                            menu: 'ledState',
                            defaultValue: 'OFF'
                        },
                        GREEN: {
                            type: ArgumentType.STRING,
                            menu: 'ledState',
                            defaultValue: 'OFF'
                        }
                    }
                },
                {
                    opcode: 'buttonPressed',
                    text: formatMessage({
                        id: 'vietrobot.buttonPressed',
                        default: 'button [PORT] pressed?',
                        description: 'is a button on some port pressed?'
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'PORT_MENU',
                            defaultValue: '0'
                        }
                    }
                },
            ],
            menus: {
                PORT_MENU: {
                    items: [ '0', '1' ]
                },
                orientations: {
                    items: ['CW', 'CCW']
                },
                ledState: {
                    items: ['ON', 'OFF']
                }
            }
        };
    }

    hexStringToByteArray(hexString) {
        if (hexString.length % 2 !== 0) {
            throw "Must have an even number of hex digits to convert to bytes";
        }/* w w w.  jav  a2 s .  c o  m*/
        var numBytes = hexString.length / 2;
        var byteArray = new Uint8Array(numBytes);
        for (var i=0; i<numBytes; i++) {
            byteArray[i] = parseInt(hexString.substr(i*2, 2), 16);
        }
        return byteArray;
    }

    displayingLedRGB(args) {
        const COLOR = args.COLOR;
        const hexstr = COLOR.substr(1, 6);
        const bytes = this.hexStringToByteArray(hexstr);

        const cmd = this._peripheral.generateCommand(
            MSG_CMD_ID.PUT_LEDRGB,
            [
                bytes[0],
                bytes[1],
                bytes[2]
            ]
        );
        console.log(typeof cmd);
        console.log(cmd);
        this._peripheral.send(cmd);
        // const result = Atomics.waitAsync(notifyFlags, 0, 1, 2000).then();
    }

    motorSetPower(args) {
        const PORT = Cast.toNumber(args.PORT);
        const POWER = Cast.toNumber(args.POWER);

        const cmd = this._peripheral.generateCommand(
            MSG_CMD_ID.PUT_DCMOTOR,
            [
                CMD_PUT_DCMOTOR.PORT_POWER,
                PORT,
                POWER
            ]            
        );
        console.log(cmd);
        this._peripheral.send(cmd);
    }

    motorSetOrientation(args) {
        const PORT      = Cast.toNumber(args.PORT);
        let ORIENTATION = 0x00;

        if (args.ORIENTATION === "CW")
            ORIENTATION = 0x00;
        else if (args.ORIENTATION === "CCW")
            ORIENTATION = 0x01;
        else {
            ORIENTATION = 0xFF;
            console.log("Orientation" + ORIENTATION);
        }
        const cmd = this._peripheral.generateCommand(
            MSG_CMD_ID.PUT_DCMOTOR,
            [
                CMD_PUT_DCMOTOR.PORT_DIRECTION,
                PORT,
                ORIENTATION
            ]
        );
        console.log(cmd);
        this._peripheral.send(cmd);
    }

    motorFullControl(args) {
        const PORT      = Cast.toNumber(args.PORT);
        const POWER     = Cast.toNumber(args.POWER);
        let ORIENTATION = 0x00;

        if (args.ORIENTATION === "CW")
            ORIENTATION = 0x00;
        else if (args.ORIENTATION === "CCW")
            ORIENTATION = 0x01;
        else {
            ORIENTATION = 0xFF;
            console.log("Orientation" + ORIENTATION);
        }
        const cmd = this._peripheral.generateCommand(
            MSG_CMD_ID.PUT_DCMOTOR,
            [
                CMD_PUT_DCMOTOR.PORT_FULL_CTRL,
                PORT,
                ORIENTATION,
                POWER
            ]
        );
        console.log(cmd);
        this._peripheral.send(cmd);
    }

    ledTrafficCmd(args) {
        const PORT = Cast.toNumber(args.PORT);
        const LEDS_ = [args.GREEN, args.YELLOW, args.RED];
        let led_state_ = [];

        LEDS_.forEach((arg) => {
            let state;
            if (arg === 'ON') {
                state = 0x01;
            }
            else if (arg === 'OFF') {
                state = 0x00;
            }
            else {
                state = 0xFF;
            }
            led_state_.push(state);
        });

        const cmd = this._peripheral.generateCommand(
            MSG_CMD_ID.PUT_LEDTRAFFIC,
            [
                PORT,
            ].concat(
                led_state_
            )
        );
        console.log(cmd);
        this._peripheral.send(cmd);
    }

    servoAngle(args) {
        const PORT = Cast.toNumber(args.PORT);
        const params = [args.ANGLE_1, args.ANGLE_2, args.ANGLE_3];
        console.log(params);
        let vals = []; 
        params.forEach((param) => {
            const val = MathUtil.clamp(param, 0, 180);
            vals.push(val);
        });
        console.log("vals: ");
        console.log(vals);

        const cmd = this._peripheral.generateCommand(
            MSG_CMD_ID.PUT_SERVO,
            [ PORT ].concat(vals)
        );
        //console.log(cmd);
        this._peripheral.send(cmd);

    }

    buttonPressed(args) {
        const PORT = Cast.toNumber(args.PORT);
        const cmd = this._peripheral.generateCommand(
            MSG_CMD_ID.GET_BUTTON_STATE,
            [ PORT ]
        );

        console.log(cmd);
        this._peripheral.send(cmd);
        // Wait 100ms to check the value
    }


}

module.exports = Scratch3VietRobotBlocks;
