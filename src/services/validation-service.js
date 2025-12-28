/**
 * Validation service using AJV for JSON Schema validation
 */
class ValidationService {
  constructor() {
    this._ajv = null;
    this._validator = null;
    this._initialized = false;
    this._initPromise = null;
  }

  /**
   * Initialize AJV (loads from CDN)
   * @returns {Promise<void>}
   */
  async init() {
    if (this._initialized) return;
    if (this._initPromise) return this._initPromise;

    this._initPromise = this._doInit();
    return this._initPromise;
  }

  async _doInit() {
    try {
      // Dynamic imports from CDN (requires importmap)
      const [AjvModule, addFormatsModule] = await Promise.all([
        import('ajv'),
        import('ajv-formats')
      ]);

      const Ajv = AjvModule.default || AjvModule;
      const addFormats = addFormatsModule.default || addFormatsModule;

      this._ajv = new Ajv({
        allErrors: true,
        verbose: true,
        strict: false
      });

      addFormats(this._ajv);
      this._initialized = true;
    } catch (err) {
      console.error('Failed to initialize AJV:', err);
      throw err;
    }
  }

  /**
   * Compile a JSON schema
   * @param {object} schema - JSON Schema to compile
   * @returns {{ success: boolean, error?: string }}
   */
  compileSchema(schema) {
    if (!this._initialized || !this._ajv) {
      return { success: false, error: 'Validation service not initialized' };
    }

    if (!schema || Object.keys(schema).length === 0) {
      this._validator = null;
      return { success: true };
    }

    try {
      // Remove $schema property as AJV handles it internally
      const schemaToCompile = { ...schema };
      delete schemaToCompile.$schema;

      this._validator = this._ajv.compile(schemaToCompile);
      return { success: true };
    } catch (err) {
      this._validator = null;
      return { success: false, error: err.message };
    }
  }

  /**
   * Validate data against the compiled schema
   * @param {*} data - Data to validate
   * @returns {{ isValid: boolean, errors: Array<{ path: string, message: string, keyword: string }> }}
   */
  validate(data) {
    if (!this._validator) {
      return { isValid: true, errors: [] };
    }

    try {
      const valid = this._validator(data);
      if (valid) {
        return { isValid: true, errors: [] };
      }

      const errors = (this._validator.errors || []).map(err => ({
        path: err.instancePath || '',
        message: err.message || 'Validation error',
        keyword: err.keyword
      }));

      return { isValid: false, errors };
    } catch (err) {
      return {
        isValid: false,
        errors: [{ path: '', message: err.message, keyword: 'error' }]
      };
    }
  }

  /**
   * Check if service is initialized
   * @returns {boolean}
   */
  get isInitialized() {
    return this._initialized;
  }
}

// Export singleton instance
export const validationService = new ValidationService();
